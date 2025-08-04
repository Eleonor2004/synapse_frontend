// src/components/workbench/IndividualInfo.tsx

"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Phone, 
  MessageSquare, 
  Clock, 
  Calendar, 
  Activity,
  TrendingUp,
  Smartphone,
  Users,
  BarChart3,
  AlertTriangle
} from "lucide-react";
import { ExcelData, Individual } from "@/app/[locale]/workbench/page";

// Define a type for a single interaction record to avoid 'any'
interface InteractionRecord {
  [key: string]: string | number | undefined | null;
  "Numéro A"?: string;
  caller?: string;
  source?: string;
  "Numéro B"?: string;
  called?: string;
  target?: string;
  Type?: string;
  Durée?: string;
  duration?: string;
  Heure?: string;
  time?: string;
  Date?: string;
  timestamp?: string;
}

interface InteractionStats {
  totalInteractions: number;
  callsOut: number;
  callsIn: number;
  smsOut: number;
  smsIn: number;
  uniqueContacts: number;
  avgCallDuration: number;
  mostFrequentContact: string;
  timePattern: { [hour: string]: number };
  recentActivity: InteractionRecord[];
  suspiciousPatterns: string[];
}

export function IndividualInfo({ individual, data }: IndividualInfoProps) {
  const stats: InteractionStats | null = useMemo(() => {
    if (!individual || !data.listings) return null;

    const phoneNumber = individual.phoneNumber;
    // Cast listings to the new type
    const interactions = (data.listings as InteractionRecord[]).filter(listing => 
      String(listing["Numéro A"] || listing.caller || listing.source) === phoneNumber ||
      String(listing["Numéro B"] || listing.called || listing.target) === phoneNumber
    );

    const contacts = new Set<string>();
    const contactFrequency: { [contact: string]: number } = {};
    const timePattern: { [hour: string]: number } = {};
    let totalCallDuration = 0;
    let callCount = 0;
    let callsOut = 0, callsIn = 0, smsOut = 0, smsIn = 0;

    for (let i = 0; i < 24; i++) {
      timePattern[i.toString().padStart(2, '0')] = 0;
    }

    interactions.forEach((interaction) => {
      const isOutgoing = String(interaction["Numéro A"] || interaction.caller || interaction.source) === phoneNumber;
      const contact = isOutgoing 
        ? String(interaction["Numéro B"] || interaction.called || interaction.target)
        : String(interaction["Numéro A"] || interaction.caller || interaction.source);
      
      const type = String(interaction.Type || 'appel').toLowerCase();
      const duration = parseFloat(String(interaction.Durée || interaction.duration || 0));
      
      contacts.add(contact);
      contactFrequency[contact] = (contactFrequency[contact] || 0) + 1;

      if (type.includes('sms')) {
        if (isOutgoing) smsOut++; else smsIn++;
      } else {
        if (isOutgoing) callsOut++; else callsIn++;
        if (duration > 0) {
          totalCallDuration += duration;
          callCount++;
        }
      }

      const timeStr = String(interaction.Heure || interaction.time || interaction.Date);
      if (timeStr) {
        try {
            const date = new Date(timeStr);
            if(!isNaN(date.getTime())) {
                const hour = date.getHours().toString().padStart(2, '0');
                if(timePattern[hour] !== undefined) {
                    timePattern[hour]++;
                }
            }
        } catch(e) {
            // Ignore invalid date strings
        }
      }
    });
    
    const mostFrequentContact = Object.keys(contactFrequency).reduce((a, b) => 
      contactFrequency[a] > contactFrequency[b] ? a : b, ''
    );

    const suspiciousPatterns: string[] = [];
    if (interactions.length > 100) suspiciousPatterns.push("High activity volume");
    if (contacts.size > 50) suspiciousPatterns.push("Large contact network");
    if (callsOut > callsIn * 3) suspiciousPatterns.push("Unusual outgoing call pattern");
    
    const timestamps = interactions
      .map(i => new Date(String(i.Date || i.timestamp)).getTime())
      .filter(t => !isNaN(t))
      .sort();

    let burstCount = 0;
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] - timestamps[i-1] < 300000) { // 5 minutes
        burstCount++;
      }
    }
    if (burstCount > 10) suspiciousPatterns.push("Burst communication pattern");

    const recentActivity = interactions
      .sort((a, b) => new Date(String(b.Date || b.timestamp)).getTime() - new Date(String(a.Date || a.timestamp)).getTime())
      .slice(0, 10);

    return {
      totalInteractions: interactions.length,
      callsOut,
      callsIn,
      smsOut,
      smsIn,
      uniqueContacts: contacts.size,
      avgCallDuration: callCount > 0 ? totalCallDuration / callCount : 0,
      mostFrequentContact,
      timePattern,
      recentActivity,
      suspiciousPatterns
    };
  }, [individual, data]);

  if (!individual) {
    return (
      <div className="h-full bg-card border border-border rounded-lg shadow-sm flex items-center justify-center">
        <div className="text-center p-6">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Individual Selected</h3>
          <p className="text-sm text-muted-foreground">
            Click on a node in the network graph to view detailed information
          </p>
        </div>
      </div>
    );
  }

  const getActivityColor = (value: number, max: number) => {
    if (max === 0) return "bg-muted";
    const intensity = value / max;
    if (intensity === 0) return "bg-muted";
    if (intensity <= 0.25) return "bg-green-200 dark:bg-green-900";
    if (intensity <= 0.5) return "bg-yellow-200 dark:bg-yellow-900";
    if (intensity <= 0.75) return "bg-orange-200 dark:bg-orange-900";
    return "bg-red-200 dark:bg-red-900";
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const maxTimeActivity = Math.max(...Object.values(stats?.timePattern || {0:0}));

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={individual.id}
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-white">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Individual Profile</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {individual.phoneNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Interactions", value: stats?.totalInteractions || 0, icon: Activity, color: "text-primary" },
                { label: "Unique Contacts", value: stats?.uniqueContacts || 0, icon: Users, color: "text-secondary" },
                { label: "Avg Call Duration", value: formatDuration(stats?.avgCallDuration || 0), icon: Clock, color: "text-green-600" },
                { label: "Activity Score", value: Math.min(100, Math.round((stats?.totalInteractions || 0) / 10)), icon: TrendingUp, color: "text-orange-600" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-muted/30 rounded-lg p-3 border border-border/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Communication Breakdown
              </h4>
              <div className="space-y-2">
                {[
                  { label: "Outgoing Calls", value: stats?.callsOut || 0, icon: Phone, color: "bg-blue-500" },
                  { label: "Incoming Calls", value: stats?.callsIn || 0, icon: Phone, color: "bg-blue-300" },
                  { label: "Outgoing SMS", value: stats?.smsOut || 0, icon: MessageSquare, color: "bg-green-500" },
                  { label: "Incoming SMS", value: stats?.smsIn || 0, icon: MessageSquare, color: "bg-green-300" }
                ].map((item, index) => {
                  const total = (stats?.totalInteractions || 1);
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;
                  
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-md bg-muted/20"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                          <span className="text-sm text-muted-foreground">{item.value}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${item.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Activity Pattern (24h)
              </h4>
              <div className="grid grid-cols-12 gap-1">
                {Object.entries(stats?.timePattern || {}).map(([hour, count]) => (
                  <div
                    key={hour}
                    className={`
                      aspect-square rounded-sm flex items-center justify-center text-xs font-medium
                      ${getActivityColor(count, maxTimeActivity)}
                      ${count > 0 ? "text-foreground" : "text-muted-foreground"}
                    `}
                    title={`${hour}:00 - ${count} interactions`}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            {stats?.mostFrequentContact && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Top Contact
                </h4>
                <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-secondary text-white">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium text-foreground">
                        {stats.mostFrequentContact}
                      </p>
                      <p className="text-xs text-muted-foreground">Most frequent contact</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stats?.suspiciousPatterns && stats.suspiciousPatterns.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Detected Patterns
                </h4>
                <div className="space-y-2">
                  {stats.suspiciousPatterns.map((pattern, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 p-2 rounded-md bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800"
                    >
                      <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-orange-700 dark:text-orange-300">{pattern}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Recent Activity
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {stats?.recentActivity.map((activity, index) => {
                  const isOutgoing = String(activity["Numéro A"] || activity.caller || activity.source) === individual.phoneNumber;
                  const contact = isOutgoing 
                    ? String(activity["Numéro B"] || activity.called || activity.target)
                    : String(activity["Numéro A"] || activity.caller || activity.source);
                  const type = String(activity.Type || 'appel').toLowerCase();
                  const date = new Date(String(activity.Date || activity.timestamp));
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-2 rounded-md bg-muted/20 text-sm"
                    >
                      <div className={`p-1 rounded-full ${isOutgoing ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}>
                        {type.includes('sms') ? (
                          <MessageSquare className="w-3 h-3 text-blue-600" />
                        ) : (
                          <Phone className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs text-foreground">{contact}</span>
                          <span className="text-xs text-muted-foreground">
                            {isOutgoing ? '→' : '←'} {type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {!isNaN(date.getTime()) ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` : 'Invalid date'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {individual.imei && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Device Information
                </h4>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">IMEI</p>
                  <p className="font-mono text-sm font-medium text-foreground">{individual.imei}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
