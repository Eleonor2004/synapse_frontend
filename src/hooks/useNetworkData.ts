// src/hooks/useNetworkData.ts
"use client";

import { useMemo } from 'react';
import * as d3 from 'd3';
import { cleanPhoneNumber, findFieldValue, isSMSData, parseDuration, getNodeSize, DynamicRow } from '../utils/network-graph-utils';

// Define your types here or import them
export interface ExcelData {
  listings?: any[];
}

export interface Filters {
  interactionType: "all" | "calls" | "sms";
  dateRange: { start: string; end: string };
  individuals: string[];
  minInteractions: number;
}

export interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  phoneNumber: string;
  interactions: number;
  type: 'primary' | 'secondary' | 'service';
  size: number;
  color: string;
  imei?: string;
  location?: string;
  degree?: number;
}

export interface NetworkEdge extends d3.SimulationLinkDatum<NetworkNode> {
  id: string;
  source: string | NetworkNode;
  target: string | NetworkNode;
  interactions: number;
  callCount: number;
  smsCount: number;
  width: number;
}


export const useNetworkData = (data: ExcelData | null, filters: Filters) => {
  const networkData = useMemo(() => {
    if (!data?.listings || !Array.isArray(data.listings)) {
      return { nodes: [], edges: [] };
    }

    const interactions = new Map<string, { calls: number; sms: number; totalDuration: number; contacts: Set<string>; imei?: string; location?: string; }>();
    const edgeMap = new Map<string, { calls: number; sms: number; totalDuration: number; }>();

    const callerFields = ['caller_num', 'caller', 'calling_number', 'from_number', 'source_number', 'numéro appelant', 'numero appelant', 'appelant', 'émetteur', 'emetteur'];
    const calleeFields = ['callee_num', 'callee', 'called_number', 'to_number', 'destination_number', 'numéro appelé', 'numero appele', 'appelé', 'appele', 'destinataire', 'récepteur', 'recepteur'];
    const durationFields = ['duration', 'duration_str', 'call_duration', 'length', 'durée', 'duree', 'durée appel', 'duree appel'];
    const imeiFields = ['imei', 'device_id', 'imei_caller', 'imei_source'];
    const locationFields = ['location', 'caller_location', 'source_location', 'localisation', 'localisation numéro appelant', 'localisation numero appelant'];

    data.listings.forEach((row: DynamicRow) => {
      if (!row || typeof row !== 'object') return;

      const caller = findFieldValue(row, callerFields);
      const callee = findFieldValue(row, calleeFields);
      const durationStr = findFieldValue(row, durationFields);
      const imei = findFieldValue(row, imeiFields);
      const location = findFieldValue(row, locationFields);

      if (!caller && !callee) return;

      const cleanCaller = caller ? cleanPhoneNumber(caller) : null;
      const cleanCallee = callee ? cleanPhoneNumber(callee) : null;

      if (!cleanCaller && !cleanCallee) return;

      const { seconds, isSMS } = parseDuration(durationStr || null);

      if (cleanCaller) {
        if (!interactions.has(cleanCaller)) {
          interactions.set(cleanCaller, { calls: 0, sms: 0, totalDuration: 0, contacts: new Set(), imei, location });
        }
        const callerData = interactions.get(cleanCaller)!;
        if (isSMS) callerData.sms++; else { callerData.calls++; callerData.totalDuration += seconds; }
        if (cleanCallee) callerData.contacts.add(cleanCallee);
      }

      if (cleanCallee) {
        if (!interactions.has(cleanCallee)) {
          interactions.set(cleanCallee, { calls: 0, sms: 0, totalDuration: 0, contacts: new Set() });
        }
        const calleeData = interactions.get(cleanCallee)!;
        if (isSMS) calleeData.sms++; else { calleeData.calls++; calleeData.totalDuration += seconds; }
        if (cleanCaller) calleeData.contacts.add(cleanCaller);
      }

      if (cleanCaller && cleanCallee) {
        const edgeKey = [cleanCaller, cleanCallee].sort().join('|');
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, { calls: 0, sms: 0, totalDuration: 0 });
        }
        const edgeData = edgeMap.get(edgeKey)!;
        if (isSMS) edgeData.sms++; else { edgeData.calls++; edgeData.totalDuration += seconds; }
      }
    });

    const filteredInteractions = new Map(Array.from(interactions.entries()).filter(([phone, data]) => {
      if (filters.minInteractions && (data.calls + data.sms) < filters.minInteractions) return false;
      if (filters.interactionType === 'calls' && data.calls === 0) return false;
      if (filters.interactionType === 'sms' && data.sms === 0) return false;
      if (filters.individuals?.length > 0 && !filters.individuals.includes(phone)) return false;
      return true;
    }));

    const nodes: NetworkNode[] = Array.from(filteredInteractions.entries()).map(([phone, data]) => {
      const totalInteractions = data.calls + data.sms;
      let nodeType: 'primary' | 'secondary' | 'service' = 'secondary';
      if (totalInteractions > 20) nodeType = 'primary';
      if (data.contacts.size > 10) nodeType = 'service';
      const size = getNodeSize(totalInteractions);
      const colors = { primary: '#3B82F6', secondary: '#10B981', service: '#F59E0B' };
      return { 
        id: phone, 
        label: phone, 
        phoneNumber: phone, 
        interactions: totalInteractions, 
        type: nodeType, 
        size, 
        color: colors[nodeType], 
        imei: data.imei, 
        location: data.location,
        degree: data.contacts.size
      };
    });

    const edges: NetworkEdge[] = Array.from(edgeMap.entries()).reduce((acc, [edgeKey, edgeData]) => {
      const [phone1, phone2] = edgeKey.split('|');
      if (filteredInteractions.has(phone1) && filteredInteractions.has(phone2)) {
        const totalInteractions = edgeData.calls + edgeData.sms;
        const width = Math.min(8, Math.max(1, totalInteractions * 0.5));
        acc.push({ 
          id: edgeKey, 
          source: phone1, 
          target: phone2, 
          interactions: totalInteractions, 
          callCount: edgeData.calls, 
          smsCount: edgeData.sms, 
          width 
        });
      }
      return acc;
    }, [] as NetworkEdge[]);

    return { nodes, edges };
  }, [data, filters]);

  return networkData;
};