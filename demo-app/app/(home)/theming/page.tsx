'use client';

import React, { useState, useEffect } from 'react';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';
import { 
  generatePortalThemeURL, 
  appendThemeToURL, 
  getThemePreset, 
  validateCustomTheme,
  createCustomThemeFromPreset 
} from '@finatic/client';

export default function ThemingPage() {
  const { finatic, addLog } = useFinatic();
  const [selectedPreset, setSelectedPreset] = useState<string>('dark');
  const [customTheme, setCustomTheme] = useState<any>(null);
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});
  const [portalUrl, setPortalUrl] = useState('');
  const [portalError, setPortalError] = useState('');

  // Available preset themes
  const presetThemes = ['dark', 'light', 'corporateBlue', 'purple', 'green', 'orange'];

  // Sample custom themes for testing - showcasing the new optional properties
  const sampleCustomThemes = {
    // Simple theme - just a few colors
    simpleBlue: {
      colors: {
        background: {
          primary: '#1e3a8a'  // Just change the main background
        },
        status: {
          connected: '#3b82f6'  // And the connected status
        }
      }
    } as any,
    
    // Brand colors only
    brandRed: {
      branding: {
        primaryColor: '#dc2626'
      }
    } as any,
    
    // Just typography
    customFont: {
      typography: {
        fontFamily: {
          primary: 'Inter, sans-serif'
        }
      }
    } as any,
    
    // Complete custom theme
    neonPink: {
      mode: 'dark',
      colors: {
        background: {
          primary: '#1a1a1a',
          secondary: '#2a2a2a',
          tertiary: '#3a3a3a',
          accent: 'rgba(255, 0, 150, 0.1)',
          glass: 'rgba(255, 255, 255, 0.05)',
        },
        status: {
          connected: '#FF0096',
          disconnected: '#EF4444',
          warning: '#F59E0B',
          pending: '#8B5CF6',
          error: '#EF4444',
          success: '#FF0096',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#CBD5E1',
          muted: '#94A3B8',
          inverse: '#000000',
        },
        border: {
          primary: 'rgba(255, 0, 150, 0.2)',
          secondary: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 0, 150, 0.4)',
          focus: 'rgba(255, 0, 150, 0.6)',
          accent: '#FF0096',
        },
        input: {
          background: '#2a2a2a',
          border: 'rgba(255, 0, 150, 0.2)',
          borderFocus: '#FF0096',
          text: '#FFFFFF',
          placeholder: '#94A3B8',
        },
        button: {
          primary: {
            background: '#FF0096',
            text: '#FFFFFF',
            hover: '#E6007A',
            active: '#CC005E',
          },
          secondary: {
            background: 'transparent',
            text: '#FF0096',
            border: '#FF0096',
            hover: 'rgba(255, 0, 150, 0.1)',
            active: 'rgba(255, 0, 150, 0.2)',
          },
        },
      },
      branding: {
        primaryColor: '#FF0096'
      }
    },
    
    cyberGreen: {
      mode: 'dark',
      colors: {
        background: {
          primary: '#0a0a0a',
          secondary: '#1a1a1a',
          tertiary: '#2a2a2a',
          accent: 'rgba(0, 255, 100, 0.1)',
          glass: 'rgba(255, 255, 255, 0.05)',
        },
        status: {
          connected: '#00FF64',
          disconnected: '#EF4444',
          warning: '#F59E0B',
          pending: '#8B5CF6',
          error: '#EF4444',
          success: '#00FF64',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#CBD5E1',
          muted: '#94A3B8',
          inverse: '#000000',
        },
        border: {
          primary: 'rgba(0, 255, 100, 0.2)',
          secondary: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(0, 255, 100, 0.4)',
          focus: 'rgba(0, 255, 100, 0.6)',
          accent: '#00FF64',
        },
        input: {
          background: '#1a1a1a',
          border: 'rgba(0, 255, 100, 0.2)',
          borderFocus: '#00FF64',
          text: '#FFFFFF',
          placeholder: '#94A3B8',
        },
        button: {
          primary: {
            background: '#00FF64',
            text: '#000000',
            hover: '#00E55A',
            active: '#00CC50',
          },
          secondary: {
            background: 'transparent',
            text: '#00FF64',
            border: '#00FF64',
            hover: 'rgba(0, 255, 100, 0.1)',
            active: 'rgba(0, 255, 100, 0.2)',
          },
        },
      },
      branding: {
        primaryColor: '#00FF64'
      }
    }
  };

  // Generate URLs for all preset themes
  useEffect(() => {
    const baseUrl = 'https://portal.finatic.dev/companies';
    const urls: Record<string, string> = {};
    
    presetThemes.forEach(preset => {
      urls[preset] = generatePortalThemeURL(baseUrl, { preset: preset as any });
    });
    
    // Add custom theme URLs
    Object.entries(sampleCustomThemes).forEach(([name, theme]) => {
      urls[name] = generatePortalThemeURL(baseUrl, { custom: theme as any });
    });
    
    setGeneratedUrls(urls);
  }, []);

  // Validate themes
  useEffect(() => {
    const results: Record<string, boolean> = {};
    
    // Validate preset themes
    presetThemes.forEach(preset => {
      const theme = getThemePreset(preset);
      results[preset] = theme ? validateCustomTheme(theme) : false;
    });
    
    // Validate custom themes
    Object.entries(sampleCustomThemes).forEach(([name, theme]) => {
      results[name] = validateCustomTheme(theme as any);
    });
    
    setValidationResults(results);
  }, []);

  const handleOpenPortalWithPreset = async (preset: string) => {
    if (!finatic) return;
    
    addLog('info', `Opening portal with ${preset} theme...`);
    setPortalError('');
    
    try {
      await finatic.openPortal({
        theme: { preset: preset as any },
        onSuccess: (userId: string) => {
          addLog('success', `Portal opened with ${preset} theme for user: ${userId}`);
          setPortalUrl(`Portal opened with ${preset} theme`);
        },
        onError: (error: Error) => {
          setPortalError(error.message);
          addLog('error', error.message);
        },
        onClose: () => {
          addLog('info', 'Portal closed');
        },
      });
    } catch (err: any) {
      setPortalError(err.message || 'Unknown error');
      addLog('error', err.message || 'Unknown error');
    }
  };

  const handleOpenPortalWithCustom = async (themeName: string, theme: any) => {
    if (!finatic) return;
    
    addLog('info', `Opening portal with custom ${themeName} theme...`);
    setPortalError('');
    
    try {
      await finatic.openPortal({
        theme: { custom: theme },
        onSuccess: (userId: string) => {
          addLog('success', `Portal opened with custom ${themeName} theme for user: ${userId}`);
          setPortalUrl(`Portal opened with custom ${themeName} theme`);
        },
        onError: (error: Error) => {
          setPortalError(error.message);
          addLog('error', error.message);
        },
        onClose: () => {
          addLog('info', 'Portal closed');
        },
      });
    } catch (err: any) {
      setPortalError(err.message || 'Unknown error');
      addLog('error', err.message || 'Unknown error');
    }
  };

  const handleCreateCustomTheme = () => {
    const baseTheme = getThemePreset(selectedPreset);
    if (!baseTheme) return;
    
    const customTheme = createCustomThemeFromPreset(selectedPreset, {
      branding: {
        primaryColor: '#FF6B6B'
      },
      colors: {
        status: {
          connected: '#FF6B6B',
          success: '#FF6B6B'
        } as any
      }
    } as any);
    
    if (customTheme) {
      setCustomTheme(customTheme);
      addLog('success', `Created custom theme from ${selectedPreset} preset`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Theme Testing</h1>
          <p className="text-gray-600 mt-1">Test portal theming with optional properties - only provide what you want to customize!</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${finatic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {finatic ? '✅ SDK Ready' : '❌ SDK Not Ready'}
          </div>
        </div>
      </div>

      {/* Preset Themes Section */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Preset Themes</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presetThemes.map((preset) => (
            <div key={preset} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 capitalize">{preset}</h4>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  validationResults[preset] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {validationResults[preset] ? '✅ Valid' : '❌ Invalid'}
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleOpenPortalWithPreset(preset)}
                  className="w-full btn btn-primary btn-sm"
                  disabled={!finatic || !validationResults[preset]}
                >
                  🚪 Open Portal
                </button>
                
                <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 font-mono break-all">
                  {generatedUrls[preset]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Themes Section */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Custom Themes</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(sampleCustomThemes).map(([name, theme]) => (
            <div key={name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 capitalize">{name.replace(/([A-Z])/g, ' $1')}</h4>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  validationResults[name] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {validationResults[name] ? '✅ Valid' : '❌ Invalid'}
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleOpenPortalWithCustom(name, theme)}
                  className="w-full btn btn-primary btn-sm"
                  disabled={!finatic || !validationResults[name]}
                >
                  🚪 Open Portal
                </button>
                
                <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 font-mono break-all">
                  {generatedUrls[name]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Theme Examples Section */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Simple Theme Examples</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            These examples show how easy it is to create themes with the new optional properties system. 
            You only need to provide what you want to customize!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h4 className="font-medium text-gray-900 mb-2">Simple Blue</h4>
            <div className="text-xs text-gray-500 mb-3">
              Just 2 colors - background and status
            </div>
            <button
              onClick={() => handleOpenPortalWithCustom('simpleBlue', sampleCustomThemes.simpleBlue)}
              className="w-full btn btn-primary btn-sm"
              disabled={!finatic}
            >
              🚪 Test Simple Blue
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h4 className="font-medium text-gray-900 mb-2">Brand Red</h4>
            <div className="text-xs text-gray-500 mb-3">
              Only brand color - everything else defaults
            </div>
            <button
              onClick={() => handleOpenPortalWithCustom('brandRed', sampleCustomThemes.brandRed)}
              className="w-full btn btn-primary btn-sm"
              disabled={!finatic}
            >
              🚪 Test Brand Red
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h4 className="font-medium text-gray-900 mb-2">Custom Font</h4>
            <div className="text-xs text-gray-500 mb-3">
              Just typography - Inter font family
            </div>
            <button
              onClick={() => handleOpenPortalWithCustom('customFont', sampleCustomThemes.customFont)}
              className="w-full btn btn-primary btn-sm"
              disabled={!finatic}
            >
              🚪 Test Custom Font
            </button>
          </div>
        </div>
      </div>

      {/* Theme Creation Section */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Advanced Theme Creation</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {presetThemes.map(preset => (
                <option key={preset} value={preset}>{preset}</option>
              ))}
            </select>
            
            <button
              onClick={handleCreateCustomTheme}
              className="btn btn-secondary"
            >
              Create Custom Theme
            </button>
          </div>
          
          {customTheme && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Custom Theme Created</h4>
              <div className="text-sm text-green-700 mb-3">
                Based on {selectedPreset} preset with modified branding and status colors
              </div>
              <button
                onClick={() => handleOpenPortalWithCustom('custom', customTheme)}
                className="btn btn-primary btn-sm"
                disabled={!finatic}
              >
                🚪 Open Portal with Custom Theme
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Theme Code Examples */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Theme Code Examples</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Simple Theme (Just Colors)</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`const simpleTheme = {
  colors: {
    background: {
      primary: '#1e3a8a'  // Just change the main background
    },
    status: {
      connected: '#3b82f6'  // And the connected status
    }
  }
};

await finatic.openPortal({
  theme: { custom: simpleTheme }
});`}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Brand Only Theme</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`const brandTheme = {
  branding: {
    primaryColor: '#dc2626'  // Only brand color
  }
};

await finatic.openPortal({
  theme: { custom: brandTheme }
});`}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Typography Only Theme</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`const fontTheme = {
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif'  // Just change the font
    }
  }
};

await finatic.openPortal({
  theme: { custom: fontTheme }
});`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* URL Generation Testing */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">URL Generation Testing</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">generatePortalThemeURL()</h4>
              <div className="text-sm text-gray-600 mb-2">
                Generates a new URL with theme parameters
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 font-mono break-all">
                {generatedUrls.dark}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">appendThemeToURL()</h4>
              <div className="text-sm text-gray-600 mb-2">
                Appends theme parameters to existing URL
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 font-mono break-all">
                {appendThemeToURL('https://portal.finatic.dev/companies?session_id=123', { preset: 'purple' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Status */}
      {(portalUrl || portalError) && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg"></div>
            <h3 className="text-lg font-semibold text-gray-900">Portal Status</h3>
          </div>
          
          {portalUrl && (
            <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">{portalUrl}</span>
              </div>
            </div>
          )}
          
          {portalError && (
            <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">Error: {portalError}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Theme Validation Results */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Theme Validation Results</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(validationResults).map(([name, isValid]) => (
            <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 capitalize">{name}</span>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isValid ? '✅ Valid' : '❌ Invalid'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
