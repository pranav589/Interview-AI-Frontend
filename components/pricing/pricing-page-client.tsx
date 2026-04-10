'use client';

import { Navbar } from '@/components/common/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MESSAGES, DEFAULT_FREE_CREDITS } from '@/lib/constants';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: MESSAGES.PRICING.FREE_DESC,
    features: {
      'Interviews/month': DEFAULT_FREE_CREDITS.toString(),
      'Interview types': 'Behavioral only',
      'Feedback detail': 'Basic summary',
      'Resume analysis': false,
      'Priority AI': false,
      'Question bank': false,
      'Export reports': false,
    },
    cta: 'Current Plan',
    highlight: false,
    icon: Zap,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mo',
    description: MESSAGES.PRICING.PRO_DESC,
    features: {
      'Interviews/month': 'Unlimited',
      'Interview types': 'All types',
      'Feedback detail': 'Per-question + model answers',
      'Resume analysis': true,
      'Priority AI': '✅ (GPT-4o)',
      'Question bank': true,
      'Export reports': 'PDF',
    },
    cta: 'Upgrade to Pro',
    highlight: true,
    icon: Sparkles,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: MESSAGES.PRICING.ENTERPRISE_DESC,
    features: {
      'Interviews/month': 'Unlimited',
      'Interview types': 'All + Custom',
      'Feedback detail': '+ Team analytics',
      'Resume analysis': true,
      'Priority AI': '✅ (GPT-4.1)',
      'Question bank': '✅ + Custom',
      'Export reports': 'PDF + JSON API',
    },
    cta: 'Contact Sales',
    highlight: false,
    icon: ShieldCheck,
  },
];

const featureList = [
  'Interviews/month',
  'Interview types',
  'Feedback detail',
  'Resume analysis',
  'Priority AI',
  'Question bank',
  'Export reports',
];

export default function PricingPageClient() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Choose the plan that's right for your career goals. 
            All plans include access to our core AI interview engine.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.2 }}
            >
              <Card className={`relative h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                tier.highlight ? 'border-primary ring-2 ring-primary/20 shadow-xl' : 'hover:border-primary/50'
              }`}>
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    MOST POPULAR
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    tier.highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <tier.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="mt-2 min-h-[40px]">{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-5xl font-black">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                  
                  <div className="space-y-4">
                    {featureList.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        {tier.features[feature as keyof typeof tier.features] === false ? (
                          <X className="w-5 h-5 text-muted-foreground/30 mt-0.5" />
                        ) : (
                          <Check className="w-5 h-5 text-primary mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm ${tier.features[feature as keyof typeof tier.features] === false ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                            <span className="font-medium text-muted-foreground mr-1">{feature}:</span>
                            {typeof tier.features[feature as keyof typeof tier.features] === 'boolean' 
                              ? (tier.features[feature as keyof typeof tier.features] ? '✅' : '❌')
                              : tier.features[feature as keyof typeof tier.features]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={`w-full h-12 text-lg font-bold ${
                      tier.highlight ? 'shadow-xl shadow-primary/20' : ''
                    }`}
                    variant={tier.highlight ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/auth/signup">{tier.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ or Comparison Table (Simplified) */}
        <div className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border/50 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-8 text-center text-primary">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="font-bold text-lg">How do credits work?</h3>
              <p className="text-muted-foreground text-sm">Credits are used to start new interview sessions. Free users receive {DEFAULT_FREE_CREDITS} credits every 30 days. Pro and Enterprise users have unlimited access.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Can I switch plans later?</h3>
              <p className="text-muted-foreground text-sm">Yes, you can upgrade to a higher tier at any time. When upgrading, your features will be unlocked immediately.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">What is GPT-4o Priority?</h3>
              <p className="text-muted-foreground text-sm">Pro users get priority access to more advanced AI models like GPT-4o, resulting in more natural conversations and nuanced technical feedback.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">What are model answers?</h3>
              <p className="text-muted-foreground text-sm">For every question you answer, our AI provides a "Model Answer"—a world-class response you can learn from to improve your own technique.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
