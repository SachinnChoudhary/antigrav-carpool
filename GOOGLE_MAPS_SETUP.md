# Google Maps Setup Guide

## 1. Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Enable billing (required for Maps API)
   - Free tier: $200/month credit
   - Typical usage: ~$50-100/month for small apps

## 2. Enable Required APIs

Go to "APIs & Services" → "Library" and enable:

- ✅ **Maps JavaScript API**
- ✅ **Places API** (for autocomplete)
- ✅ **Geocoding API** (for address conversion)
- ✅ **Directions API** (for routes)
- ✅ **Distance Matrix API** (for distance calculation)

## 3. Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key (starts with `AIza...`)

## 4. Restrict API Key (Recommended)

1. Click on your API key to edit
2. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add: `http://localhost:3000/*` (for development)
   - Add: `https://yourdomain.com/*` (for production)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose the 5 APIs listed above

## 5. Add to Environment Variables

Create or update `.env.local`:

```env
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza_your_api_key_here
```

## 6. Restart Dev Server

```bash
npm run dev
```

## 7. Test

1. Go to search page
2. Try location autocomplete
3. View map with route

## Pricing (as of 2024)

- **Maps JavaScript API**: $7 per 1,000 loads
- **Places Autocomplete**: $2.83 per 1,000 requests
- **Geocoding**: $5 per 1,000 requests
- **Directions**: $5 per 1,000 requests
- **Distance Matrix**: $5 per 1,000 elements

**Free tier**: $200/month credit = ~28,000 map loads/month

## Cost Optimization Tips

1. **Cache results** - Store geocoded addresses
2. **Limit autocomplete** - Only show after 3+ characters
3. **Use static maps** - For thumbnails/previews
4. **Set quotas** - Limit daily requests in console
5. **Monitor usage** - Check billing dashboard regularly

## Troubleshooting

### "This page can't load Google Maps correctly"
- Check API key is correct
- Verify billing is enabled
- Check API restrictions

### Autocomplete not working
- Ensure Places API is enabled
- Check browser console for errors
- Verify API key restrictions

### Map not loading
- Check Maps JavaScript API is enabled
- Verify internet connection
- Check for console errors

## Support

- Google Maps Docs: https://developers.google.com/maps
- Pricing: https://cloud.google.com/maps-platform/pricing
- API Console: https://console.cloud.google.com
