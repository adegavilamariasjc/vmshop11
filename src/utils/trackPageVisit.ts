
import { supabase } from '@/integrations/supabase/client';

export async function trackPageVisit(pagina = window.location.pathname, acao = 'pageload') {
  try {
    // Add client information to tracking data
    const clientInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer || 'direct'
    };

    console.log(`Tracking page visit: ${pagina}, action: ${acao}`);

    // Use timeout to ensure the request completes even if the page is being navigated away from
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Fixed: Don't wrap the object in an array and remove 'returning' option
    const { error } = await supabase
      .from('page_visits')
      .insert({
        pagina,
        acao,
        data_hora: new Date().toISOString(),
        detalhes: clientInfo
      });

    clearTimeout(timeoutId);

    if (error) {
      console.error('Error tracking page visit:', error);
      return false;
    }
    
    console.log('Page visit tracked successfully:', pagina, acao);
    return true;
  } catch (err) {
    console.error('Error tracking page visit:', err);
    return false;
  }
}

export function setupGlobalTracking() {
  if (typeof window !== 'undefined') {
    if ((window as any).__trackingSetup) {
      console.log('Global tracking already setup, skipping');
      return Promise.resolve(true);
    }
    
    // Track initial page load with retry logic
    const trackInitialPageLoad = async (retries = 3) => {
      try {
        const success = await trackPageVisit();
        if (success) {
          console.log('Initial page tracking successful');
          return true;
        }
        
        if (retries > 0) {
          console.log(`Initial page tracking failed, retrying... (${retries} attempts left)`);
          setTimeout(() => trackInitialPageLoad(retries - 1), 1000);
        }
        
        return false;
      } catch (err) {
        console.error('Error in initial page tracking:', err);
        if (retries > 0) {
          setTimeout(() => trackInitialPageLoad(retries - 1), 1000);
        }
        return false;
      }
    };
    
    // Set flag to prevent duplicate tracking
    (window as any).__trackingSetup = true;
    
    // Configure listeners for URL changes via History API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(state, title, url) {
      originalPushState.apply(this, [state, title, url]);
      trackPageVisit(url?.toString() || window.location.pathname, 'navigation');
    };
    
    history.replaceState = function(state, title, url) {
      originalReplaceState.apply(this, [state, title, url]);
      trackPageVisit(url?.toString() || window.location.pathname, 'navigation');
    };
    
    // Register navigation events
    window.addEventListener('popstate', () => {
      trackPageVisit(window.location.pathname, 'navigation');
    });
    
    // Log successful setup
    console.log('Global tracking setup complete');
    
    // Start initial tracking
    return trackInitialPageLoad();
  }
  
  return Promise.resolve(false);
}

// Helper function to check if tracking is working
export async function checkTrackingStatus() {
  try {
    const { data, error } = await supabase
      .from('page_visits')
      .select('id')
      .order('data_hora', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error checking tracking status:', error);
      return {
        working: false,
        error: error.message
      };
    }
    
    return {
      working: true,
      lastEntry: data && data.length > 0 ? data[0].id : null
    };
  } catch (err) {
    console.error('Exception checking tracking status:', err);
    return {
      working: false,
      error: (err as Error).message
    };
  }
}
