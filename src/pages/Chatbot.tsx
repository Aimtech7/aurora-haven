import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Loader2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGES = {
  en: "Hello, I'm here to support you. You're in a safe space. How can I help you today?",
  sw: "Habari, niko hapa kukusaidia. Uko mahali salama. Ninaweza kukusaidiaje leo?",
};

const PLACEHOLDERS = {
  en: "Type your message... (Press Enter to send, Shift+Enter for new line)",
  sw: "Andika ujumbe wako... (Bonyeza Enter kutuma, Shift+Enter kwa mstari mpya)",
};

const Chatbot = () => {
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: WELCOME_MESSAGES.en,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chatbot`;
    
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          language,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
          return;
        }
        if (response.status === 402) {
          toast.error("Service temporarily unavailable. Please try again later.");
          return;
        }
        throw new Error("Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let textBuffer = "";

      // Add empty assistant message that we'll update
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
      // Remove the empty assistant message if error
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Get AI response
    await streamChat(userMessage);
    
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-2xl font-bold">
              {language === "en" ? "AI Support Chat" : "Mazungumzo ya Msaada wa AI"}
            </h1>
            <Select value={language} onValueChange={(val: "en" | "sw") => {
              setLanguage(val);
              setMessages([{
                role: "assistant",
                content: WELCOME_MESSAGES[val],
              }]);
            }}>
              <SelectTrigger className="w-[140px]">
                <Languages className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sw">Kiswahili</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === "en" 
              ? "Compassionate guidance available 24/7"
              : "Mwongozo wa huruma unapatikana saa 24/7"}
          </p>
        </div>

        {/* Messages */}
        <Card className="flex-1 p-4 mb-4 overflow-y-auto shadow-card">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-gradient-primary text-white"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDERS[language]}
            className="resize-none"
            rows={2}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-full aspect-square"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </main>

      <EmergencyButton />
    </div>
  );
};

export default Chatbot;