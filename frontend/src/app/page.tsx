import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Shield, FileText, Mic, Video, TrendingUp, Target, Zap } from 'lucide-react';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            AI-Powered Detection
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Multi-Modal Fake News Detection
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze text, audio, and video content with state-of-the-art AI models to detect
            misinformation and deepfakes with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/analyze"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Start Analyzing
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comprehensive Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our system analyzes content across multiple modalities to provide accurate and
              reliable fake news detection.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg border border-border p-6 space-y-4">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Text Analysis</h3>
              <p className="text-muted-foreground">
                Advanced NLP models detect linguistic patterns, claims, and manipulation tactics in
                written content.
              </p>
            </div>
            <div className="bg-background rounded-lg border border-border p-6 space-y-4">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Audio Detection</h3>
              <p className="text-muted-foreground">
                Identify deepfake audio, voice manipulation, and audio inconsistencies using
                specialized ML models.
              </p>
            </div>
            <div className="bg-background rounded-lg border border-border p-6 space-y-4">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Video Analysis</h3>
              <p className="text-muted-foreground">
                Detect deepfake videos, face manipulation, and temporal inconsistencies with
                computer vision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge technology and designed for accuracy and transparency.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">High Accuracy</h3>
              <p className="text-muted-foreground">
                State-of-the-art models trained on extensive datasets for reliable detection.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Fast Processing</h3>
              <p className="text-muted-foreground">
                Optimized inference pipeline for quick results without compromising quality.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Detailed Insights</h3>
              <p className="text-muted-foreground">
                Comprehensive visualizations and explanations for every detection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 bg-muted/50">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <Shield className="h-16 w-16 text-primary mx-auto" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Detect Misinformation?
          </h2>
          <p className="text-lg text-muted-foreground">
            Start analyzing content now and get instant, accurate results powered by AI.
          </p>
          <Link
            href="/analyze"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
