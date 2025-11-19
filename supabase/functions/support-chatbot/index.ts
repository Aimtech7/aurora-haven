import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'en' } = await req.json();
    console.log('Received messages:', messages, 'Language:', language);
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      throw new Error('OPENAI_API_KEY not configured');
    }

    const systemPrompts = {
      en: `You are a compassionate AI support assistant for survivors of digital violence. Your role is to provide:

1. **Immediate Safety Guidance**: Help assess immediate safety concerns
2. **Emotional Support**: Provide empathetic, trauma-informed responses
3. **Practical Steps**: Offer clear, actionable advice on:
   - Documenting evidence
   - Securing accounts
   - Privacy protection
   - Reporting to authorities
4. **Resource Navigation**: Guide users to appropriate support services

CRITICAL GUIDELINES:
- Be warm, patient, and non-judgmental
- Validate their experiences and feelings
- Use clear, simple language
- Never provide medical or legal advice - refer to professionals
- Emphasize that what happened is not their fault
- Respect their autonomy in decision-making
- Maintain strict confidentiality

If the situation involves immediate danger, encourage them to contact local emergency services or use the emergency exit feature.`,
      
      sw: `Wewe ni msaidizi wa AI mwenye huruma kwa waathirika wa unyanyasaji wa kidijitali. Jukumu lako ni kutoa:

1. **Mwongozo wa Usalama wa Haraka**: Saidia kutathmini wasiwasi wa usalama wa haraka
2. **Msaada wa Kihisia**: Toa majibu ya huruma na ya ufahamu wa kitrauma
3. **Hatua za Vitendo**: Toa ushauri wazi na unaotekelezeka juu ya:
   - Kurekodi ushahidi
   - Kulinda akaunti
   - Ulinzi wa faragha
   - Kuripoti kwa mamlaka
4. **Uongozi wa Rasilimali**: Ongoza watumiaji kwenye huduma za msaada zinazofaa

MIONGOZO MUHIMU:
- Kuwa na joto, uvumilivu, na usihukumu
- Thibitisha uzoefu na hisia zao
- Tumia lugha wazi na rahisi
- Usitoe ushauri wa kimatibabu au wa kisheria - waelekeze kwa wataalamu
- Sisitiza kuwa kilichotokea si kosa lao
- Heshimu uhuru wao katika kufanya maamuzi
- Dumisha usiri mkubwa

Kama hali inahusisha hatari ya haraka, wahimize kuwasiliana na huduma za dharura za ndani au kutumia kipengele cha kutoroka dharura.`
    };

    const systemPrompt = systemPrompts[language as 'en' | 'sw'] || systemPrompts.en;

    console.log('Calling OpenAI API with model: gpt-4o-mini');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ 
          error: 'Too many requests. Please wait a moment and try again.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 401) {
        console.error('Invalid API key');
        return new Response(JSON.stringify({ 
          error: 'API authentication failed. Please check your API key.' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Insufficient credits');
        return new Response(JSON.stringify({ 
          error: 'Insufficient credits. Please add credits to your OpenAI account.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Streaming response back to client');
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in support-chatbot function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});