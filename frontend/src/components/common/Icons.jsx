import React from 'react';

export const Icons = {
  requests: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2" />
      <path d="M2 12h20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12l-4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12l4 4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12l-4 4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  
  traffic: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 8l4 4-4 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8l-4 4 4 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  bandwidth: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 12H2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12h3.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="15" cy="12" r="1" fill="#F59E0B" />
      <circle cx="9" cy="12" r="1" fill="#F59E0B" />
    </svg>
  ),
  
  threats: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2L2 22h20L12 2z" fill="#EF4444" fillOpacity="0.1" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="2" stroke="#EF4444" strokeWidth="1.5" />
    </svg>
  ),
  
  cachedRequests: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v8h8" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21l5-5" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 16l-5-5" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="#8B5CF6" fillOpacity="0.3" stroke="#8B5CF6" strokeWidth="1" />
    </svg>
  ),
  
  cachedBytes: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" stroke="#8B5CF6" strokeWidth="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" stroke="#8B5CF6" strokeWidth="2" />
      <path d="M6 6h.01M6 18h.01" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 6h.01M12 18h.01" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 6h.01M18 18h.01" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 10h4M6 14h4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 10h4M14 14h4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  
  cacheHitRate: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2" />
      <path d="M8 12l2.5 2.5L16 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="1" />
      <path d="M12 2v2" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 20v2" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 12h2" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 12h2" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  
  originPull: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2v20M2 12h20" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" stroke="#F97316" strokeWidth="2" />
      <path d="M12 4a8 8 0 0 1 0 16 8 8 0 0 1 0-16z" stroke="#F97316" strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M12 2a10 10 0 0 0 0 20 10 10 0 0 0 0-20z" stroke="#F97316" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  ),
  
  intercepts: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12l2 2 4-4" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3a9 9 0 0 0-9 9H2l10 10 10-10h-9z" fill="#EF4444" fillOpacity="0.1" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v18h18" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  ),
  
  geography: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2" />
      <path d="M2 12h20" stroke="#3B82F6" strokeWidth="2" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12l-4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12l4 4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12l-4 4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  
  trafficChart: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3v18h18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 16l4-8 4 4 4-6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="8" r="1.5" fill="#10B981" />
      <circle cx="11" cy="8" r="1.5" fill="#10B981" />
      <circle cx="15" cy="12" r="1.5" fill="#10B981" />
      <circle cx="19" cy="6" r="1.5" fill="#10B981" />
    </svg>
  ),
  
  browsers: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="18" rx="2" ry="2" stroke="#6366F1" strokeWidth="2" />
      <line x1="2" y1="8" x2="22" y2="8" stroke="#6366F1" strokeWidth="2" />
      <circle cx="8" cy="14" r="2" stroke="#6366F1" strokeWidth="2" />
      <circle cx="16" cy="14" r="2" stroke="#6366F1" strokeWidth="2" />
      <circle cx="12" cy="14" r="2" stroke="#6366F1" strokeWidth="2" />
      <path d="M8 3v2M16 3v2" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  
  os: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" stroke="#EC4899" strokeWidth="2" />
      <path d="M12 18v2" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="3" stroke="#EC4899" strokeWidth="2" />
      <path d="M8 5l4-2 4 2" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="#EC4899" fillOpacity="0.2" stroke="#EC4899" strokeWidth="1" />
      <path d="M17 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="#EC4899" fillOpacity="0.2" stroke="#EC4899" strokeWidth="1" />
    </svg>
  ),
  
  devices: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="#14B8A6" strokeWidth="2" />
      <line x1="12" y1="18" x2="12" y2="18" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="2" stroke="#14B8A6" strokeWidth="2" />
      <rect x="7" y="12" width="10" height="4" rx="1" stroke="#14B8A6" strokeWidth="1.5" />
      <path d="M9 5h6" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 8h2M17 8h2" stroke="#14B8A6" strokeWidth="1" />
    </svg>
  ),
  
  statusCode: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="2" />
      <path d="M12 8v4M12 16h.01" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12h8" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="12" cy="12" r="3" stroke="#8B5CF6" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  
  referers: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12h4M18 12h4" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="8" r="1" fill="#06B6D4" fillOpacity="0.3" />
      <circle cx="16" cy="16" r="1" fill="#06B6D4" fillOpacity="0.3" />
    </svg>
  ),
  
  urls: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.5" stroke="#3B82F6" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="1.5" stroke="#3B82F6" strokeWidth="1.5" />
      <path d="M2 12h4M18 12h4" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 2v4M12 18v4" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  
  refresh: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  menu: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  
  cloudflare: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.5 16.5c.8-.7 1.5-1.6 1.5-2.5 0-2.2-1.8-4-4-4-1.1 0-2.1.5-2.8 1.2C13.5 10.5 12.3 10 11 10c-2.5 0-4.5 2-4.5 4.5 0 .7.2 1.4.5 2 1.7-.3 3.5.3 4.5 1.5.2-.1.4-.2.5-.3" stroke="#F38020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#F38020" fillOpacity="0.1" />
      <path d="M11 6c.5 0 1 .2 1.5.5C13 6 13.5 5.5 14 5c1.5.5 2.5 1.5 3 3" stroke="#F38020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="14" r="2" stroke="#F38020" strokeWidth="2" />
    </svg>
  ),
  
  edgeone: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#0066CC" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="#0066CC" strokeWidth="1.5" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="#0066CC" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  
  unified: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="2" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l4-4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12l-4-4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12l4 4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12l-4 4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export default Icons;
