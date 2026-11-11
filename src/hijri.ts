/**
 * Hijri & Gregorian Calendar integration for Al-Dheeniyya Arabic College.
 * Computes authentic astronomical Hijri dates with support for moon-sighting adjustment.
 */

export function formatIslamicDates(adjustmentDays = 0) {
  const now = new Date();
  
  // Gregorian formatting
  const gregOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const gregStr = now.toLocaleDateString('en-GB', gregOptions);

  // Adjusted date for lunar calculation
  const hijriDate = new Date(now.getTime());
  const adj = parseInt(String(adjustmentDays || 0), 10);
  if (!isNaN(adj) && adj !== 0) {
    hijriDate.setDate(hijriDate.getDate() + adj);
  }

  // Hijri formatting in English & Arabic
  let hijriEn = '';
  let hijriAr = '';

  try {
    const hijriFormatterEn = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    hijriEn = hijriFormatterEn.format(hijriDate);

    const hijriFormatterAr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    hijriAr = hijriFormatterAr.format(hijriDate);
  } catch {
    // Fallback if islamic-umalqura is not supported
    try {
      const hijriFormatterEn = new Intl.DateTimeFormat('en-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      hijriEn = hijriFormatterEn.format(hijriDate);
    } catch {
      hijriEn = '1448 AH';
    }
  }

  return {
    gregorian: gregStr,
    hijriEnglish: hijriEn,
    hijriArabic: hijriAr,
    rawDate: now
  };
}

export function updateHeaderDate(adjustmentDays = 0) {
  const dates = formatIslamicDates(adjustmentDays);
  
  const hijriEl = document.getElementById('hijriDateText');
  const gregEl = document.getElementById('gregDateText');
  const todayEl = document.getElementById('today');

  if (hijriEl) {
    hijriEl.textContent = `${dates.hijriEnglish} (${dates.hijriArabic})`;
  }
  if (gregEl) {
    gregEl.textContent = dates.gregorian;
  }
  if (todayEl) {
    todayEl.textContent = `${dates.gregorian} · ${dates.hijriEnglish}`;
  }
}
