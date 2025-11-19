import { Link } from "react-router-dom";
import { Shield, MessageCircle, BookOpen, Phone, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Header } from "@/components/Header";

const Home = () => {
  const features = [
    {
      icon: FileText,
      title: "Anonymous Reporting",
      description: "Report incidents safely without revealing your identity",
      link: "/report",
      color: "text-primary",
    },
    {
      icon: MessageCircle,
      title: "AI Support Chat",
      description: "Get immediate guidance from our compassionate AI assistant",
      link: "/chatbot",
      color: "text-accent",
    },
    {
      icon: BookOpen,
      title: "Safety Resources",
      description: "Learn about digital safety, privacy, and your rights",
      link: "/resources",
      color: "text-primary",
    },
    {
      icon: Phone,
      title: "Support Directory",
      description: "Connect with verified helplines and support services",
      link: "/directory",
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Survivor Hub & Information System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A safe, anonymous platform for survivors of digital violence. 
            Get support, resources, and guidance in a secure environment.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/report">
                <FileText className="w-5 h-5 mr-2" />
                Report Incident
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/chatbot">
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Support
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.link}>
              <Card className="p-6 h-full hover:shadow-card transition-all duration-300 cursor-pointer group">
                <div className="space-y-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center",
                    "group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </section>

        {/* Safety Notice */}
        <section className="max-w-3xl mx-auto">
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Your Safety & Privacy</h3>
                <p className="text-muted-foreground">
                  All reports are anonymous and encrypted. Uploaded evidence is automatically deleted after 48 hours. 
                  We do not track your identity or location. Press ESC twice or use the emergency button to quickly exit this site.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <EmergencyButton />
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default Home;