// src/components/workbench/IndividualInfo.tsx

"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, MessageSquare, Clock, Users, BarChart3, AlertTriangle, Smartphone, TrendingUp, Activity, Zap, Calendar } from "lucide-react";
import { ExcelData, Individual } from "@/app/[locale]/workbench/page";

// Helper functions needed for data parsing
const findFieldValue = (row: Record<string, unknown>, fields: string[]): string | null => {
  if (!row || typeof row !== 'object') return null;
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  const normalizedRow: { [key: string]: unknown } = {};
  Object.keys(row).forEach(key => {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      normalizedRow[normalize(key)] = row[key];
    }
  });
  for (const field of fields) {
    const normalizedField = normalize(field);
    if (normalizedRow[normalizedField]) {
      return String(normalizedRow[normalizedField]);
    }
  }
  return null;
};

const isSMSData = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const upperValue = value.toUpperCase();
  return upperValue.includes('SMS') || /^[A-F0-9]{6,}$/i.test(value.trim());
};

const parseDuration = (durationStr: string | null): { seconds: number; isSMS: boolean } => {
  if (!durationStr || typeof durationStr !== 'string') return { seconds: 0, isSMS: false };
  const trimmed = durationStr.trim();
  if (isSMSData(trimmed)) return { seconds: 0, isSMS: true };
  const timeMatch = trimmed.match(/(\d+):(\d+)(?::(\d+))?/);
  if (timeMatch) {
    const h = timeMatch[3] ? parseInt(timeMatch[1], 10) || 0 : 0;
    const m = timeMatch[3] ? parseInt(timeMatch[2], 10) : parseInt(timeMatch[1], 10) || 0;
    const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : parseInt(timeMatch[2], 10) || 0;
    return { seconds: (h * 3600) + (m * 60) + s, isSMS: false };
  }
  const numMatch = trimmed.match(/(\d+)/);
  if (numMatch) return { seconds: parseInt(numMatch[1], 10) || 0, isSMS: false };
  return { seconds: 0, isSMS: false };
};


interface InteractionStats {
  totalInteractions: number;
  callsOut: number;
  callsIn: number;
  smsOut: number;
  smsIn: number;
  uniqueContacts: number;
  avgCallDurationSec: number;
  mostFrequentContact: { number: string; count: number } | null;
  timePattern: { [hour: string]: number };
  detectedPatterns: string[];
  recentActivity: Record<string, any>[];
}

export function IndividualInfo({ individual, data }: { individual: Individual | null, data: ExcelData }) {

  const stats: InteractionStats | null = useMemo(() => {
    if (!individual || !data.listings) return null;

    const phoneNumber = individual.phoneNumber;
    const callerFields = ['caller_num', 'caller', 'calling_number', 'from_number'];
    const calleeFields = ['callee_num', 'callee', 'called_number', 'to_number'];
    const durationFields = ['duration', 'duree appel'];
    const dateFields = ['timestamp', 'date', 'date début appel'];

    const interactions = data.listings.filter(row => 
        findFieldValue(row, callerFields) === phoneNumber || 
        findFieldValue(row, calleeFields) === phoneNumber
    );

    const contacts = new Set<string>();
    const contactFrequency: { [contact: string]: number } = {};
    const timePattern: { [hour: string]: number } = Object.fromEntries(Array.from({ length: 24 }, (_, i) => [i.toString().padStart(2, '0'), 0]));
    let totalCallDuration = 0;
    let callCount = 0;
    let nightCalls = 0;
    let callsOut = 0, callsIn = 0, smsOut = 0, smsIn = 0;

    interactions.forEach((row) => {
      const isOutgoing = findFieldValue(row, callerFields) === phoneNumber;
      const contact = (isOutgoing ? findFieldValue(row, calleeFields) : findFieldValue(row, callerFields)) || "Unknown";
      
      contacts.add(contact);
      contactFrequency[contact] = (contactFrequency[contact] || 0) + 1;

      const durationStr = findFieldValue(row, durationFields);
      const { seconds, isSMS } = parseDuration(durationStr);

      if (isSMS) {
        if (isOutgoing) smsOut++; else smsIn++;
      } else {
        if (isOutgoing) callsOut++; else callsIn++;
        if (seconds > 0) {
          totalCallDuration += seconds;
          callCount++;
        }
      }

      const dateStr = findFieldValue(row, dateFields);
      if (dateStr) {
        try {
            const date = new Date(dateStr);
            if(!isNaN(date.getTime())) {
                const hour = date.getHours();
                timePattern[hour.toString().padStart(2, '0')]++;
                if (hour < 6 || hour > 22) nightCalls++;
            }
        } catch(e) {}
      }
    });
    
    const mostFreq = Object.entries(contactFrequency).sort((a, b) => b[1] - a[1])[0];

    const suspiciousPatterns: string[] = [];
    if (interactions.length > 200) suspiciousPatterns.push("Very high interaction volume");
    if (nightCalls > interactions.length / 4 && nightCalls > 10) suspiciousPatterns.push("Significant night-time activity");
    if (callsOut > callsIn * 3 && callsOut > 10) suspiciousPatterns.push("Primarily makes outgoing calls");
    
    const recentActivity = interactions
      .map(row => ({ ...row, _timestamp: new Date(findFieldValue(row, dateFields) || 0).getTime()}))
      .sort((a, b) => b._timestamp - a._timestamp)
      .slice(0, 10);

    return {
      totalInteractions: interactions.length,
      callsOut, callsIn, smsOut, smsIn,
      uniqueContacts: contacts.size,
      avgCallDurationSec: callCount > 0 ? totalCallDuration / callCount : 0,
      mostFrequentContact: mostFreq ? { number: mostFreq[0], count: mostFreq[1] } : null,
      timePattern,
      detectedPatterns: suspiciousPatterns,
      recentActivity
    };
  }, [individual, data]);

  if (!individual || !stats) {
    return (
      <div className="h-full bg-card border border-border rounded-lg flex items-center justify-center p-6 text-center">
          <div>
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">No Individual Selected</h3>
            <p className="text-sm text-muted-foreground">Click a node in the graph to see its profile.</p>
          </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getActivityColor = (value: number, max: number) => {
    if (max === 0 || value === 0) return "bg-muted/50";
    const intensity = value / max;
    if (intensity <= 0.25) return "bg-green-300";
    if (intensity <= 0.5) return "bg-yellow-300";
    if (intensity <= 0.75) return "bg-orange-300";
    return "bg-red-400";
  };

  const maxTimeActivity = Math.max(...Object.values(stats.timePattern), 1);

  return (
    <AnimatePresence>
      <motion.div key={individual.id} className="h-full bg-card border border-border rounded-lg flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold">{individual.phoneNumber}</h3>
          <p className="text-sm text-muted-foreground">Analytical Profile</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Interactions", value: stats.totalInteractions, icon: Zap },
              { label: "Unique Contacts", value: stats.uniqueContacts, icon: Users },
              { label: "Avg. Call", value: formatDuration(stats.avgCallDurationSec), icon: Clock },
              { label: "Activity Score", value: Math.min(100, stats.totalInteractions), icon: TrendingUp }
            ].map((stat) => (
                <div key={stat.label} className="bg-muted p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <stat.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{stat.label}</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
            ))}
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-sm"><BarChart3 className="w-4 h-4 inline mr-2" />Communication Breakdown</h4>
            <div className="space-y-2">
                {[
                  { label: "Outgoing Calls", value: stats.callsOut, color: "bg-blue-500" },
                  { label: "Incoming Calls", value: stats.callsIn, color: "bg-sky-400" },
                  { label: "Outgoing SMS", value: stats.smsOut, color: "bg-green-500" },
                  { label: "Incoming SMS", value: stats.smsIn, color: "bg-emerald-400" }
                ].map(item => {
                    const percentage = stats.totalInteractions > 0 ? (item.value / stats.totalInteractions) * 100 : 0;
                    return (
                        <div key={item.label} className="text-xs">
                            <div className="flex justify-between mb-1">
                                <span>{item.label}</span>
                                <span className="font-semibold">{item.value}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${percentage}%` }}/>
                            </div>
                        </div>
                    )
                })}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-sm"><Clock className="w-4 h-4 inline mr-2" />Activity Pattern (24h)</h4>
            <div className="grid grid-cols-12 gap-1">
                {Object.entries(stats.timePattern).map(([hour, count]) => (
                    <div key={hour} title={`${hour}:00 - ${count} interactions`} 
                         className={`h-6 rounded-sm flex items-center justify-center text-[10px] font-mono ${getActivityColor(count, maxTimeActivity)}`}
                    >
                      {hour}
                    </div>
                ))}
            </div>
          </div>
          
          {stats.detectedPatterns.length > 0 && (
            <div>
              <h4 className="font-semibold text-orange-500 mb-2 text-sm"><AlertTriangle className="w-4 h-4 inline mr-2" />Detected Patterns</h4>
               <div className="space-y-2">
                 {stats.detectedPatterns.map(pattern => ( 
                   <div key={pattern} className="flex items-start gap-2 text-xs bg-orange-500/10 p-2 rounded-md">
                       <AlertTriangle className="w-3 h-3 mt-0.5 text-orange-500 flex-shrink-0" />
                       <span className="text-orange-600">{pattern}</span>
                   </div> 
                 ))}
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}