import { Link } from "react-router-dom";
import { Shield, MessageCircle, BookOpen, Phone, FileText, Lock, Heart, Users, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";

const Home = () => {
  const features = [
    {
      icon: FileText,
      title: "Anonymous Reporting",
      description: "Report incidents safely without revealing your identity. Your data is encrypted and automatically deleted after 48 hours.",
      link: "/report",
    },
    {
      icon: MessageCircle,
      title: "AI Support Chat",
      description: "Get immediate, compassionate guidance 24/7 from our trauma-informed AI assistant in English or Swahili.",
      link: "/chatbot",
    },
    {
      icon: BookOpen,
      title: "Safety Resources",
      description: "Access comprehensive guides on digital safety, cyberstalking prevention, and protecting your privacy online.",
      link: "/resources",
    },
    {
      icon: Phone,
      title: "Support Directory",
      description: "Connect with verified helplines, counselors, and safe NGOs ready to help you through this journey.",
      link: "/directory",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Access Safely",
      description: "Visit our platform from any device. Use the emergency exit button if you need to leave quickly.",
    },
    {
      number: "02",
      title: "Get Support",
      description: "Chat with our AI assistant or explore resources. No registration required, completely anonymous.",
    },
    {
      number: "03",
      title: "Take Action",
      description: "Report incidents, document evidence, and connect with professional support services when you're ready.",
    },
  ];

  const trustIndicators = [
    { icon: Lock, text: "End-to-End Encrypted" },
    { icon: Shield, text: "Anonymous by Default" },
    { icon: Clock, text: "24/7 Available" },
    { icon: Heart, text: "Trauma-Informed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      <main className="container mx-auto px-4 space-y-24 pb-16">
        {/* Hero Section */}
        <section className="text-center space-y-8 pt-16 md:pt-24">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary mb-4 animate-scale-in">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
              You're Not Alone.
              <span className="block text-primary mt-2">
                We're Here to Help.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A safe, anonymous platform for survivors of digital violence. 
              Get immediate support, access resources, and connect with professional help—all in a secure, confidential environment.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <Button asChild size="lg" className="rounded-full shadow-elegant hover-scale">
              <Link to="/chatbot">
                <MessageCircle className="w-5 h-5 mr-2" />
                Talk to Support AI
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full hover-scale">
              <Link to="/report">
                <FileText className="w-5 h-5 mr-2" />
                Report Incident
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm">
            {trustIndicators.map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-5xl mx-auto">
          <Card className="p-8 md:p-12 bg-gradient-primary text-white shadow-card">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-90" />
                <div className="text-3xl md:text-4xl font-bold">100%</div>
                <div className="text-sm opacity-90">Anonymous & Confidential</div>
              </div>
              <div className="space-y-2">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-90" />
                <div className="text-3xl md:text-4xl font-bold">24/7</div>
                <div className="text-sm opacity-90">Support Available</div>
              </div>
              <div className="space-y-2">
                <Shield className="w-10 h-10 mx-auto mb-3 opacity-90" />
                <div className="text-3xl md:text-4xl font-bold">Safe</div>
                <div className="text-sm opacity-90">Encrypted Platform</div>
              </div>
            </div>
          </Card>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Getting support is simple, safe, and completely on your terms
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={step.number} className="p-6 space-y-4 hover:shadow-card transition-all duration-300">
                <div className="text-5xl font-bold text-primary/20">{step.number}</div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Comprehensive Support Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to stay safe, get support, and take action
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.link}>
                <Card className="p-8 h-full hover:shadow-card transition-all duration-300 cursor-pointer group">
                  <div className="space-y-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center",
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                    <div className="pt-2 text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                      Learn more →
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* What We Provide */}
        <section className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 space-y-6">
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-3xl font-bold">What We Provide</h2>
              <p className="text-muted-foreground">Our commitment to your safety and wellbeing</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Immediate Safety Guidance</h4>
                  <p className="text-sm text-muted-foreground">Get real-time help to protect yourself from ongoing threats</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Emotional Support</h4>
                  <p className="text-sm text-muted-foreground">Compassionate, trauma-informed responses 24/7</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Evidence Documentation</h4>
                  <p className="text-sm text-muted-foreground">Learn how to safely document and preserve evidence</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Resource Navigation</h4>
                  <p className="text-sm text-muted-foreground">Connect with verified professional support services</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Privacy Protection</h4>
                  <p className="text-sm text-muted-foreground">Tools and tips to secure your digital presence</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Multi-Language Support</h4>
                  <p className="text-sm text-muted-foreground">Available in English and Swahili</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Safety Notice */}
        <section className="max-w-3xl mx-auto">
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Your Safety & Privacy Matter</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All your data is encrypted and stored anonymously. Reports and evidence are automatically deleted after 48 hours. 
                  We never collect personal information, and you can use the emergency exit button at any time to quickly leave this site.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  This platform provides information and support, but is not a substitute for professional medical, legal, or mental health services.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mx-auto">
            Ready to Take the First Step?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            You deserve support. Start by talking to our AI assistant or explore our resources at your own pace.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button asChild size="lg" className="rounded-full shadow-elegant hover-scale">
              <Link to="/chatbot">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Conversation
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full hover-scale">
              <Link to="/resources">
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Resources
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <EmergencyButton />
    </div>
  );
};

export default Home;