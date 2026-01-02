import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Shield, FileText, Mic, Video, TrendingUp, Target, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="container py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-in fade-in slide-in-from-bottom-3 duration-500">
            🤖 AI-Powered Detection System
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            Multi-Modal{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Fake News Detection
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000">
            Analyze text, audio, and video content with state-of-the-art AI models to detect
            misinformation and deepfakes with confidence and precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <Button asChild size="lg" className="gap-2">
              <Link href="/analyze">
                Start Analyzing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Comprehensive Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our system analyzes content across multiple modalities to provide accurate and
              reliable fake news detection.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="rounded-lg bg-blue-500/10 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Text Analysis</CardTitle>
                <CardDescription className="text-base">
                  Advanced NLP models detect linguistic patterns, claims, and manipulation tactics in
                  written content.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="rounded-lg bg-purple-500/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Audio Detection</CardTitle>
                <CardDescription className="text-base">
                  Identify deepfake audio, voice manipulation, and audio inconsistencies using
                  specialized ML models.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="rounded-lg bg-pink-500/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-pink-500" />
                </div>
                <CardTitle>Video Analysis</CardTitle>
                <CardDescription className="text-base">
                  Detect deepfake videos, face manipulation, and temporal inconsistencies with
                  computer vision.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-20 lg:py-28 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Why Choose Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge technology and designed for accuracy and transparency.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Target,
                title: 'High Accuracy',
                desc: 'State-of-the-art models trained on extensive datasets for reliable detection.',
                color: 'text-green-500'
              },
              {
                icon: Zap,
                title: 'Fast Processing',
                desc: 'Optimized inference pipeline for quick results without compromising quality.',
                color: 'text-amber-500'
              },
              {
                icon: TrendingUp,
                title: 'Detailed Insights',
                desc: 'Comprehensive visualizations and explanations for every detection.',
                color: 'text-blue-500'
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className={`rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto ${item.color}`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 lg:py-28">
        <Card className="mx-auto max-w-3xl text-center border-2">
          <CardContent className="pt-12 pb-12 space-y-6">
            <Shield className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Detect Misinformation?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Start analyzing content now and get instant, accurate results powered by AI.
            </p>
            <div className="pt-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/analyze">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
