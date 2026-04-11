"use client";

import { useInterviewers } from "@/hooks/use-interviewer";
import { Navbar } from "@/components/common/navbar";
import AuthWrapper from "@/components/auth/auth-wrapper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Briefcase,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function BrowseInterviewersPage() {
  const { data: interviewers, isLoading } = useInterviewers();
  const [search, setSearch] = useState("");

  const filteredInterviewers = interviewers?.filter(
    (i) =>
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.expertiseTags?.some((t: string) =>
        t.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-7xl mx-auto px-4 py-12">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Verified Expert Interviewers
              </h1>
              <p className="text-muted-foreground mt-1">
                Book a session with industry professionals vetted by our AI.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills or names..."
                  className="pl-10 h-11"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInterviewers?.map((interviewer, idx) => (
                <motion.div
                  key={interviewer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-primary/5 overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <Avatar className="h-14 w-14 border-2 border-primary/10">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${interviewer.name}`}
                          />
                          <AvatarFallback>
                            {interviewer.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-widest"
                        >
                          {interviewer.maxCandidateExp}+ Years Match
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {interviewer.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Briefcase className="w-3 h-3" />
                          Software Engineer
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="flex flex-wrap gap-1.5 min-h-[60px]">
                        {interviewer.expertiseTags?.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px] font-medium opacity-80 group-hover:opacity-100 transition-opacity"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/20 py-4">
                      <Link
                        href={`/interviewer/${interviewer._id}/book`}
                        className="w-full"
                      >
                        <Button className="w-full group/btn" variant="default">
                          View Availability
                          <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredInterviewers?.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl">
              <p className="text-muted-foreground">
                No interviewers found matching your criteria.
              </p>
              <Button variant="link" onClick={() => setSearch("")}>
                Clear filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </AuthWrapper>
  );
}
