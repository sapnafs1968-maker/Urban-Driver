'use client';

import React, { useState } from 'react';
import { getTranslation, LanguageCode } from '@/lib/i18n';
import { Search, MapPin, Loader2, CheckCircle2, Edit3, AlertCircle, X } from 'lucide-react';

export interface QuickCategoryItem {
  id: string;
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
  searchQuery: string;
  icon: string;
}

export const QUICK_CATEGORIES: QuickCategoryItem[] = [
  {
    id: 'hospital',
    titleKey: 'catHospital',
    defaultTitle: 'Hospital',
    descKey: 'catHospitalDesc',
    defaultDesc: 'Multi-specialty & emergency hospitals',
    searchQuery: 'Hospital',
    icon: '🏥',
  },
  {
    id: 'clinic',
    titleKey: 'catClinic',
    defaultTitle: 'Doctor / Clinic',
    descKey: 'catClinicDesc',
    defaultDesc: 'Consultations & medical clinics',
    searchQuery: 'Clinic Doctor',
    icon: '🩺',
  },
  {
    id: 'pharmacy',
    titleKey: 'catPharmacy',
    defaultTitle: 'Pharmacy',
    descKey: 'catPharmacyDesc',
    defaultDesc: 'Medical stores & 24x7 chemists',
    searchQuery: 'Pharmacy',
    icon: '💊',
  },
  {
    id: 'market',
    titleKey: 'catMarket',
    defaultTitle: 'Shopping / Market',
    descKey: 'catMarketDesc',
    defaultDesc: 'Local markets & shopping centres',
    searchQuery: 'Market Mall',
    icon: '🛍️',
  },
  {
    id: 'grocery',
    titleKey: 'catGrocery',
    defaultTitle: 'Grocery Store',
    descKey: 'catGroceryDesc',
    defaultDesc: 'Supermarkets & daily essentials',
    searchQuery: 'Supermarket Grocery',
    icon: '🛒',
  },
  {
    id: 'bank',
    titleKey: 'catBank',
    defaultTitle: 'Bank',
    descKey: 'catBankDesc',
    defaultDesc: 'Bank branches & pension offices',
    searchQuery: 'Bank',
    icon: '🏦',
  },
  {
    id: 'temple',
    titleKey: 'catTemple',
    defaultTitle: 'Temple / Worship',
    descKey: 'catTempleDesc',
    defaultDesc: 'Temples, mosques, churches & shrines',
    searchQuery: 'Temple',
    icon: '🛕',
  },
  {
    id: 'railway',
    titleKey: 'catRailway',
    defaultTitle: 'Railway Station',
    descKey: 'catRailwayDesc',
    defaultDesc: 'Train stations & metro junctions',
    searchQuery: 'Railway Station',
    icon: '🚆',
  },
  {
    id: 'airport',
    titleKey: 'catAirport',
    defaultTitle: 'Airport',
    descKey: 'catAirportDesc',
    defaultDesc: 'Domestic & international terminals',
    searchQuery: 'Airport',
    icon: '✈️',
  },
  {
    id: 'bus',
    titleKey: 'catBus',
    defaultTitle: 'Bus Station',
    descKey: 'catBusDesc',
    defaultDesc: 'Intercity & local bus terminals',
    searchQuery: 'Bus Station',
    icon: '🚌',
  },
  {
    id: 'family',
    titleKey: 'catFamily',
    defaultTitle: "Family / Friend's Home",
    descKey: 'catFamilyDesc',
    defaultDesc: 'Visit relatives or close friends',
    searchQuery: 'Residential',
    icon: '🏡',
  },
  {
    id: 'other',
    titleKey: 'catOther',
    defaultTitle: 'Other Destination',
    descKey: 'catOtherDesc',
    defaultDesc: 'Search or enter any custom address',
    searchQuery: '',
    icon: '📍',
  },
];

export interface SelectedDestinationResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
}

interface SearchResultItem {
  id: string;
  name: string;
  address: string;
  shortAddress: string;
  latitude: number;
  longitude: number;
  category: string;
}

interface InstantCategoryGridProps {
  language: LanguageCode;
  pickupLatLng?: { lat: number; lng: number };
  seniorLayout?: boolean;
  onSelectDestination: (dest: SelectedDestinationResult) => void;
}

export const InstantCategoryGrid: React.FC<InstantCategoryGridProps> = ({
  language,
  pickupLatLng,
  seniorLayout = false,
  onSelectDestination,
}) => {
  const t = getTranslation(language) as unknown as Record<string, string>;
  const [activeCategory, setActiveCategory] = useState<QuickCategoryItem | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<SelectedDestinationResult | null>(null);

  const runSearch = async (query: string, categoryHint: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    setSearchMessage(null);
    try {
      const params = new URLSearchParams({ q: trimmed });
      if (categoryHint) params.set('category', categoryHint);
      if (pickupLatLng) {
        params.set('lat', String(pickupLatLng.lat));
        params.set('lng', String(pickupLatLng.lng));
      }
      const res = await fetch(`/api/geocode/search?${params.toString()}`);
      if (!res.ok) {
        setSearchMessage(
          t.locationSearchUnavailable ||
            'Location search is temporarily unavailable. You can enter the address manually.'
        );
        setShowManual(true);
        setResults([]);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data.results) ? data.results : [];
      setResults(list);
      if (list.length === 0) {
        setSearchMessage(
          data.message ||
            t.noSearchResults ||
            'No matching places found. Try another name or enter the address manually.'
        );
      }
    } catch {
      setSearchMessage(
        t.locationSearchUnavailable ||
          'Unable to reach location search right now. You can enter your destination manually.'
      );
      setShowManual(true);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryClick = (cat: QuickCategoryItem) => {
    setActiveCategory(cat);
    setPendingConfirm(null);
    setSearchMessage(null);
    setManualAddress('');
    if (cat.id === 'other' || cat.id === 'family') {
      setSearchInput('');
      setResults([]);
      setShowManual(cat.id === 'other');
    } else {
      setSearchInput(cat.searchQuery);
      setShowManual(false);
      runSearch(cat.searchQuery, cat.defaultTitle);
    }
  };

  const handleConfirmManual = () => {
    const addr = manualAddress.trim();
    if (!addr) return;
    setPendingConfirm({
      name: activeCategory ? t[activeCategory.titleKey] || activeCategory.defaultTitle : addr.split(',')[0],
      address: addr,
      latitude: pickupLatLng?.lat || 12.9716,
      longitude: pickupLatLng?.lng || 77.5946,
      category: activeCategory?.defaultTitle || 'Custom',
    });
  };

  return (
    <div className="space-y-4">
      <div
        className={`grid gap-3 ${
          seniorLayout
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
        }`}
      >
        {QUICK_CATEGORIES.map((cat) => {
          const isSelected = activeCategory?.id === cat.id;
          const title = t[cat.titleKey] || cat.defaultTitle;
          const desc = t[cat.descKey] || cat.defaultDesc;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`text-left rounded-2xl border-2 transition-all active:scale-95 flex flex-col justify-between ${
                seniorLayout ? 'p-5 min-h-[130px]' : 'p-4 min-h-[108px]'
              } ${
                isSelected
                  ? 'border-brand-teal bg-brand-softBlue/60 shadow-md ring-2 ring-brand-teal/20'
                  : 'border-slate-200/90 bg-white hover:border-brand-teal/60 hover:shadow-md'
              }`}
            >
              <span className={seniorLayout ? 'text-4xl block mb-2' : 'text-3xl block mb-1.5'}>
                {cat.icon}
              </span>
              <div>
                <div
                  className={`font-black text-brand-navy leading-tight ${
                    seniorLayout ? 'text-base sm:text-lg' : 'text-sm'
                  }`}
                >
                  {title}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Inline Search & Confirmation Drawer for Selected Category */}
      {activeCategory && (
        <div className="bg-slate-50 border-2 border-brand-teal/30 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeCategory.icon}</span>
              <div>
                <h4 className="font-black text-brand-navy text-base sm:text-lg">
                  {t[activeCategory.titleKey] || activeCategory.defaultTitle}
                </h4>
                <p className="text-xs text-slate-500">
                  {t.searchPlacePrompt || 'Search for a nearby place or enter the exact address'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setPendingConfirm(null);
              }}
              aria-label="Close"
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search input */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    runSearch(searchInput, activeCategory.defaultTitle);
                  }
                }}
                placeholder={
                  t.searchDestinationPlaceholder ||
                  `Search ${activeCategory.defaultTitle.toLowerCase()} name or area...`
                }
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-teal"
              />
            </div>
            <button
              type="button"
              disabled={isSearching || searchInput.trim().length < 2}
              onClick={() => runSearch(searchInput, activeCategory.defaultTitle)}
              className="px-5 py-3 bg-brand-teal hover:bg-brand-tealDark disabled:opacity-50 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shrink-0"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{t.searchBtn || 'Search'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowManual((v) => !v)}
              className="px-4 py-3 bg-white border border-slate-300 hover:border-brand-teal text-slate-700 font-bold rounded-2xl text-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <Edit3 className="w-4 h-4" />
              <span>{t.enterManuallyBtn || 'Enter Manually'}</span>
            </button>
          </div>

          {searchMessage && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{searchMessage}</span>
            </div>
          )}

          {/* Live Nominatim Search Results */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {results.map((item) => {
                const isChosen = pendingConfirm?.address === item.address;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setPendingConfirm({
                        name: item.name,
                        address: item.address,
                        latitude: item.latitude,
                        longitude: item.longitude,
                        category: activeCategory.defaultTitle,
                      })
                    }
                    className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-2.5 ${
                      isChosen
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                        : 'bg-white border-slate-200 hover:border-brand-teal'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 truncate">{item.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.address}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Manual Address Fallback */}
          {showManual && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <label className="text-xs font-bold text-slate-600 block">
                {t.manualDestinationLabel || 'Enter Destination Address Manually'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="House / Building, Street, Landmark, City..."
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-teal"
                />
                <button
                  type="button"
                  disabled={!manualAddress.trim()}
                  onClick={handleConfirmManual}
                  className="px-4 py-2.5 bg-brand-navy text-white font-bold rounded-xl text-sm disabled:opacity-50"
                >
                  {t.useThisAddress || 'Use This Address'}
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Box before proceeding */}
          {pendingConfirm && (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase text-emerald-800">
                    {t.selectedDestinationLabel || 'Selected Destination'}
                  </div>
                  <div className="font-black text-slate-900 text-sm sm:text-base truncate">
                    {pendingConfirm.name}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2">{pendingConfirm.address}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectDestination(pendingConfirm);
                  setActiveCategory(null);
                  setPendingConfirm(null);
                }}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm shrink-0 shadow"
              >
                {t.confirmDestinationBtn || 'Confirm Destination →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
