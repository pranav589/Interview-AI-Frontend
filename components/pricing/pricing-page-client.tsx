'use client';

import { ProductTile } from '@/components/ui/product-tile';
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
    <div className="min-h-screen bg-canvas">
      <ProductTile
        variant="light"
        headline="Simple, transparent pricing."
        tagline="Choose the plan that's right for your career goals. All plans include access to our core AI interview engine."
      />
      
      <main className="max-w-[1024px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.2 }}
              className="flex flex-col h-full"
            >
              <Card className={`relative flex flex-col h-full border-hairline ${
                tier.highlight ? 'border-primary shadow-apple-card' : ''
              }`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-0.5 rounded-full text-[12px] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    MOST POPULAR
                  </div>
                )}
                
                <CardHeader className="text-center pt-8 pb-4">
                  <CardTitle className="text-tagline font-semibold text-ink">{tier.name}</CardTitle>
                  <CardDescription className="text-caption text-muted-foreground mt-2 px-4 min-h-[40px]">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 px-8">
                  <div className="text-center mb-8">
                    <span className="text-display-md font-semibold text-ink">{tier.price}</span>
                    {tier.period && <span className="text-caption text-muted-foreground ml-1">{tier.period}</span>}
                  </div>
                  
                  <div className="space-y-4 border-t border-hairline pt-6">
                    {featureList.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-1">
                          {tier.features[feature as keyof typeof tier.features] === false ? (
                            <X className="w-4 h-4 text-muted-foreground/30" />
                          ) : (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-caption ${tier.features[feature as keyof typeof tier.features] === false ? 'text-muted-foreground/40' : 'text-ink'}`}>
                            <span className="font-medium">{feature}:</span>{' '}
                            {typeof tier.features[feature as keyof typeof tier.features] === 'string' 
                              ? tier.features[feature as keyof typeof tier.features] 
                              : (tier.features[feature as keyof typeof tier.features] ? 'Yes' : 'No')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="p-8 pt-4">
                  <Button 
                    className="w-full rounded-pill h-10 text-button-utility font-medium"
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

        {/* FAQ Section in Parchment Style */}
        <section className="bg-canvas-parchment rounded-[18px] p-12 border border-hairline">
          <h2 className="text-display-md font-semibold text-ink mb-10 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-3">
              <h3 className="text-body-strong text-ink">How do credits work?</h3>
              <p className="text-caption text-muted-foreground">Credits are used to start new interview sessions. Free users receive {DEFAULT_FREE_CREDITS} credits every 30 days. Pro and Enterprise users have unlimited access.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-body-strong text-ink">Can I switch plans later?</h3>
              <p className="text-caption text-muted-foreground">Yes, you can upgrade to a higher tier at any time. When upgrading, your features will be unlocked immediately.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-body-strong text-ink">What is GPT-4o Priority?</h3>
              <p className="text-caption text-muted-foreground">Pro users get priority access to more advanced AI models like GPT-4o, resulting in more natural conversations and nuanced technical feedback.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-body-strong text-ink">What are model answers?</h3>
              <p className="text-caption text-muted-foreground">For every question you answer, our AI provides a "Model Answer"—a world-class response you can learn from to improve your own technique.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
