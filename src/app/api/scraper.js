import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://xdrakor28.nicewap.sbs';

// Set headers to mimic browser
const getHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
});

// Fetch and parse HTML
const fetchHTML = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: getHeaders(),
      timeout: 30000
    });
    return cheerio.load(response.data);
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
};

// Extract slug (path/directory) from URL
const extractSlug = (link) => {
  if (!link) return null;

  if (link.startsWith('http')) {
    try {
      return new URL(link).pathname;
    } catch (e) {
      // If URL parsing fails, try to extract path manually
      const match = link.match(/https?:\/\/[^\/]+(\/.*)/);
      return match ? match[1] : link;
    }
  }

  // Ensure it starts with /
  return link.startsWith('/') ? link : `/${link}`;
};

// Generate slug from title (for episode slugs)
const generateSlugFromTitle = (title) => {
  if (!title) return '';
  // Remove year in parentheses, remove special characters, lowercase, replace spaces with dashes
  let slug = title
    .replace(/\([^)]*\)/g, '') // Remove (2024) etc
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and dashes
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes

  return slug;
};

// Scrape home page
export const scrapeHome = async () => {
  try {
    const $ = await fetchHTML(BASE_URL);
    const data = {
      featured: [],
      latest: [],
      popular: []
    };

    // Scrape latest dramas - using .card.mx-auto structure
    $('.card.mx-auto').each((i, elem) => {
      const $card = $(elem);
      const $link = $card.find('a.poster').first();
      const link = $link.attr('href');

      if (!link) return;

      // Get title from .titit class
      const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
      const image = $card.find('img.poster').first().attr('src') ||
        $card.find('img.poster').first().attr('data-src');
      const duration = $card.find('.type.TV, .type.Movie').first().text().trim();

      // Get episode from .tagw .qua (same as search)
      let episode = null;
      const $tagw = $card.find('.tagw');
      if ($tagw.length > 0) {
        const $qua = $tagw.find('.qua');
        if ($qua.length > 0) {
          episode = $qua.first().text().trim();

          // Prioritize episode info (E2/16, E16 END, etc) over WEB
          $qua.each((j, quaElem) => {
            const quaText = $(quaElem).text().trim();
            if (quaText.match(/E\d+/i) && !episode.match(/E\d+/i)) {
              episode = quaText;
            } else if (quaText === 'WEB' && episode && !episode.match(/E\d+/i)) {
              episode = quaText;
            }
          });
        }
      }

      // Fallback: try .rate if .tagw not found
      if (!episode) {
        episode = $card.find('.rate').first().text().trim() || null;
      }

      // Get rating from .rat (format: <i class="fa fa-star"></i> 8.2)
      let rating = null;
      const $rat = $card.find('.rat');
      if ($rat.length > 0) {
        const ratingText = $rat.first().text().trim();
        // Extract number from rating text (e.g., "8.2" from "8.2" or " 8.2")
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]).toString();
        }
      }

      // Get quality from .titit span (first span usually contains quality)
      let quality = null;
      const $titit = $card.find('.titit');
      if ($titit.length > 0) {
        const $qualitySpan = $titit.find('span').first();
        if ($qualitySpan.length > 0) {
          const qualityText = $qualitySpan.text().trim();
          // Skip if it's a date (contains "tahun" or "yang lalu")
          if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
            quality = qualityText;
          }
        }
      }

      if (title && link) {
        // Extract slug (path/directory only)
        const slug = extractSlug(link);

        const item = {
          title,
          slug: slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          episode: episode || null,
          duration: duration || null,
          quality: quality || null,
          rating: rating || null
        };

        // Add to latest (all items go to latest for now)
        data.latest.push(item);

        // First 10 items also go to featured
        if (i < 10) {
          data.featured.push(item);
        }
      }
    });

    // Also try to get popular dramas if there's a separate section
    $('.heading1').each((i, heading) => {
      const headingText = $(heading).text().toLowerCase();
      if (headingText.includes('populer') || headingText.includes('trending')) {
        $(heading).next('.row').find('.card.mx-auto').each((j, elem) => {
          if (j < 10) {
            const $card = $(elem);
            const $link = $card.find('a.poster').first();
            const link = $link.attr('href');
            if (!link) return;

            const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
            const image = $card.find('img.poster').first().attr('src');

            if (title && link) {
              // Extract slug (path/directory only)
              const slug = extractSlug(link);

              // Get episode from .tagw .qua
              let episode = null;
              const $tagw = $card.find('.tagw');
              if ($tagw.length > 0) {
                const $qua = $tagw.find('.qua');
                if ($qua.length > 0) {
                  episode = $qua.first().text().trim();
                }
              }
              if (!episode) {
                episode = $card.find('.rate').first().text().trim() || null;
              }

              // Get rating
              let rating = null;
              const $rat = $card.find('.rat');
              if ($rat.length > 0) {
                const ratingText = $rat.first().text().trim();
                const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
                if (ratingMatch) {
                  rating = parseFloat(ratingMatch[1]).toString();
                }
              }

              // Get quality
              let quality = null;
              const $titit = $card.find('.titit');
              if ($titit.length > 0) {
                const $qualitySpan = $titit.find('span').first();
                if ($qualitySpan.length > 0) {
                  const qualityText = $qualitySpan.text().trim();
                  if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
                    quality = qualityText;
                  }
                }
              }

              data.popular.push({
                title,
                slug: slug,
                url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
                image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
                episode: episode || null,
                rating: rating || null,
                quality: quality || null
              });
            }
          }
        });
      }
    });

    return data;
  } catch (error) {
    throw new Error(`Failed to scrape home: ${error.message}`);
  }
};

// Scrape popular/most viewed dramas
export const scrapePopular = async () => {
  try {
    const $ = await fetchHTML(BASE_URL);
    const results = [];

    // Find heading "Terbanyak dilihat"
    const $heading = $('h4.heading2').filter((i, elem) => {
      return $(elem).text().toLowerCase().includes('terbanyak dilihat');
    }).first();

    if ($heading.length === 0) {
      // If heading not found, return empty array
      return results;
    }

    // Find the container .animeterbaru (next sibling or in parent)
    let $container = $heading.next('.animeterbaru');
    if ($container.length === 0) {
      $container = $heading.parent().find('.animeterbaru').first();
    }

    if ($container.length === 0) {
      // Container not found
      return results;
    }

    // Scrape .polarpost items (different structure from .card.mx-auto)
    const items = [];
    $container.find('.polarpost').each((i, elem) => {
      const $post = $(elem);

      // Get link from .polarjdl a
      const $link = $post.find('.polarjdl a').first();
      const link = $link.attr('href');

      if (!link) return;

      // Get title from .polarjdl a b or .polarjdl a
      const title = $link.find('b').first().text().trim() ||
        $link.text().trim() ||
        $link.attr('title')?.replace('Nonton Drama Korea', '').replace('Sub Indo', '').trim();

      // Get image from .polargambar img.side-poster
      const image = $post.find('.polargambar img.side-poster').first().attr('src') ||
        $post.find('.polargambar img').first().attr('src');

      // Get views from .genreser (the one with "views" text)
      let views = null;
      $post.find('.genreser').each((j, genreserElem) => {
        const text = $(genreserElem).text().trim();
        if (text.includes('views')) {
          views = text;
        }
      });

      // Get rating from star icons in .genreser
      // Count filled stars (fa-star) and half stars (fa-star-half-alt)
      let rating = null;
      const $ratingContainer = $post.find('.genreser').first();
      if ($ratingContainer.length > 0) {
        const filledStars = $ratingContainer.find('.fa-star').not('.far').length;
        const halfStars = $ratingContainer.find('.fa-star-half-alt').length;
        const emptyStars = $ratingContainer.find('.far.fa-star').length;

        // Calculate rating (5 stars max)
        if (filledStars > 0 || halfStars > 0) {
          const totalStars = filledStars + (halfStars * 0.5);
          // Convert to 10-point scale (multiply by 2)
          rating = (totalStars * 2).toString();
        }
      }

      if (title && link) {
        const slug = extractSlug(link);

        items.push({
          title,
          slug: slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          views: views || null,
          rating: rating || null
        });
      }
    });

    // Fetch detail page for each item to get episode, duration, and quality
    for (const item of items) {
      try {
        // Build detail URL
        let detailSlug = item.slug;
        if (!detailSlug.startsWith('/detail/')) {
          detailSlug = detailSlug.startsWith('/') ? `/detail${detailSlug}` : `/detail/${detailSlug}`;
        }
        const detailUrl = `${BASE_URL}${detailSlug}`;

        // Fetch detail page
        const $detail = await fetchHTML(detailUrl);

        // Get episode from title tag
        // Pattern: [Episode 1 - 12] -> E12/12 (episode terakhir dari total)
        // Or: [Episode 2 - 16] -> E2/16
        let episode = null;
        const pageTitle = $detail('title').text().trim();
        const episodeMatch = pageTitle.match(/\[Episode\s+(\d+)\s*-\s*(\d+)\]/i);
        if (episodeMatch) {
          const firstEp = parseInt(episodeMatch[1]);
          const lastEp = parseInt(episodeMatch[2]);
          // Format: E{lastEp}/{lastEp} (episode terakhir dari total)
          // Or if firstEp != 1, use E{firstEp}/{lastEp}
          if (firstEp === 1) {
            episode = `E${lastEp}/${lastEp}`;
          } else {
            episode = `E${firstEp}/${lastEp}`;
          }
        } else {
          // Try alternative pattern: Episode X atau E X
          const altMatch = pageTitle.match(/Episode\s+(\d+)/i) || pageTitle.match(/\bE\s*(\d+)\b/i);
          if (altMatch) {
            const epNum = parseInt(altMatch[1]);
            episode = `E${epNum}`;
          } else {
            // If not found, set to "1" as default
            episode = "1";
          }
        }

        // Get duration from Video Length
        // Pattern: <li><span><b>Video Length</b>: 1:40:04</span></li>
        let duration = null;
        $detail('li').each((i, liElem) => {
          const $li = $detail(liElem);
          const text = $li.text().trim();
          if (text.includes('Video Length') || text.includes('Length')) {
            const durationMatch = text.match(/(\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2})/);
            if (durationMatch) {
              duration = durationMatch[1];
            }
          }
        });

        // Get quality from title
        // Pattern: [Episode 1 - 12] 1080p, 720p &  480p Sub Indo
        // Or: Obsessed (2014) WEB-DL 360p Sub Indo
        // Take text after ] or after year, before "Sub Indo" or similar
        let quality = null;
        const bracketIndex = pageTitle.indexOf(']');
        if (bracketIndex !== -1) {
          const afterBracket = pageTitle.substring(bracketIndex + 1).trim();
          // Match quality pattern: may include WEB-DL, WEBRip, etc. followed by numbers and 'p'
          // Pattern: WEB-DL 360p, WEB-DL 720p, 1080p, 720p & 480p, etc.
          const qualityMatch = afterBracket.match(/^((?:WEB-DL|WEBRip|BluRay|HDTV|DVDRip|BRRip|TS|CAM|R5|TC|SCR|DVDSCR|R6|PDTV|SDTV|HDTVRip|WEBRip|BDRip|HDRip|UHD|4K|8K)\s*)?([\d\s,p&]+?p[\d\s,p&]*?)(?:\s*(?:Sub\s*(?:Indo|Indonesia|title)?|DrakorKita|\s*-\s*DrakorKita))/i);
          if (qualityMatch) {
            const prefix = qualityMatch[1] ? qualityMatch[1].trim() : '';
            const qualityText = qualityMatch[2] ? qualityMatch[2].trim() : '';
            quality = (prefix + ' ' + qualityText).trim();
            // Clean up extra spaces
            quality = quality.replace(/\s+/g, ' ').trim();
          } else {
            // Fallback: take everything that looks like quality (contains 'p' and numbers, may include WEB-DL)
            const fallbackMatch = afterBracket.match(/^((?:WEB-DL|WEBRip|BluRay|HDTV|DVDRip|BRRip|TS|CAM|R5|TC|SCR|DVDSCR|R6|PDTV|SDTV|HDTVRip|WEBRip|BDRip|HDRip|UHD|4K|8K)\s*)?([\d\s,p&]+?p[\d\s,p&]*?)(?:\s|$)/i);
            if (fallbackMatch) {
              const prefix = fallbackMatch[1] ? fallbackMatch[1].trim() : '';
              const qualityText = fallbackMatch[2] ? fallbackMatch[2].trim() : '';
              quality = (prefix + ' ' + qualityText).trim().replace(/\s+/g, ' ');
            }
          }
        } else {
          // Case 2: No bracket, format like "Obsessed (2014) WEB-DL 360p Sub Indo"
          // Extract year first, then get quality after year
          const yearMatch = pageTitle.match(/\((\d{4})\)/);
          if (yearMatch) {
            const yearEndIndex = pageTitle.indexOf(')', yearMatch.index);
            const afterYear = pageTitle.substring(yearEndIndex + 1).trim();
            // Match quality: WEB-DL 360p, WEB-DL 720p, etc.
            const qualityMatch = afterYear.match(/^((?:WEB-DL|WEBRip|BluRay|HDTV|DVDRip|BRRip|TS|CAM|R5|TC|SCR|DVDSCR|R6|PDTV|SDTV|HDTVRip|WEBRip|BDRip|HDRip|UHD|4K|8K)\s*)?([\d\s,p&]+?p[\d\s,p&]*?)(?:\s*(?:Sub\s*(?:Indo|Indonesia|title)?|DrakorKita|\s*-\s*DrakorKita))/i);
            if (qualityMatch) {
              const prefix = qualityMatch[1] ? qualityMatch[1].trim() : '';
              const qualityText = qualityMatch[2] ? qualityMatch[2].trim() : '';
              quality = (prefix + ' ' + qualityText).trim();
              quality = quality.replace(/\s+/g, ' ').trim();
            } else {
              // Fallback
              const fallbackMatch = afterYear.match(/^((?:WEB-DL|WEBRip|BluRay|HDTV|DVDRip|BRRip|TS|CAM|R5|TC|SCR|DVDSCR|R6|PDTV|SDTV|HDTVRip|WEBRip|BDRip|HDRip|UHD|4K|8K)\s*)?([\d\s,p&]+?p[\d\s,p&]*?)(?:\s|$)/i);
              if (fallbackMatch) {
                const prefix = fallbackMatch[1] ? fallbackMatch[1].trim() : '';
                const qualityText = fallbackMatch[2] ? fallbackMatch[2].trim() : '';
                quality = (prefix + ' ' + qualityText).trim().replace(/\s+/g, ' ');
              }
            }
          }
        }

        // Add to item
        // If episode not found, set to "1"
        item.episode = episode || "1";
        item.duration = duration || null;
        item.quality = quality || null;

      } catch (error) {
        // If detail page fetch fails, continue with other items
        console.error(`Failed to fetch detail for ${item.slug}:`, error.message);
        item.episode = "1"; // Default to "1" if not found
        item.duration = null;
        item.quality = null;
      }
    }

    return items;
  } catch (error) {
    throw new Error(`Failed to scrape popular: ${error.message}`);
  }
};

// Scrape ongoing/returning series
export const scrapeOngoing = async (page = 1) => {
  try {
    const pageNum = parseInt(page) || 1;
    const ongoingUrl = `${BASE_URL}/all?page=${pageNum}&status=returning%20series&year=c2d0de&genre=c2d0de&country=c2d0de&media_type=c2d0de`;
    const $ = await fetchHTML(ongoingUrl);
    const results = [];

    // Reuse search/ongoing card structure
    $('.card.mx-auto').each((i, elem) => {
      const $card = $(elem);
      const $link = $card.find('a.poster').first();
      const link = $link.attr('href');

      if (!link) return;

      const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
      const image = $card.find('img.poster').first().attr('src') ||
        $card.find('img.poster').first().attr('data-src');
      const duration = $card.find('.type.TV, .type.Movie').first().text().trim();

      // Episode from .tagw .qua
      let episode = null;
      const $tagw = $card.find('.tagw');
      if ($tagw.length > 0) {
        const $qua = $tagw.find('.qua');
        if ($qua.length > 0) {
          episode = $qua.first().text().trim();

          $qua.each((j, quaElem) => {
            const quaText = $(quaElem).text().trim();
            if (quaText.match(/E\d+/i) && !episode.match(/E\d+/i)) {
              episode = quaText;
            } else if (quaText === 'WEB' && episode && !episode.match(/E\d+/i)) {
              episode = quaText;
            }
          });
        }
      }

      if (!episode) {
        episode = $card.find('.rate').first().text().trim() || null;
      }

      // Rating
      let rating = null;
      const $rat = $card.find('.rat');
      if ($rat.length > 0) {
        const ratingText = $rat.first().text().trim();
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]).toString();
        }
      }

      // Quality
      let quality = null;
      const $titit = $card.find('.titit');
      if ($titit.length > 0) {
        const $qualitySpan = $titit.find('span').first();
        if ($qualitySpan.length > 0) {
          const qualityText = $qualitySpan.text().trim();
          if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
            quality = qualityText;
          }
        }
      }

      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;

      if (title && link) {
        const slug = extractSlug(link);

        results.push({
          title,
          slug: slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          episode: episode || null,
          duration: duration || null,
          quality: quality || null,
          rating: rating || null,
          year: year || null
        });
      }
    });

    // Fallback: try alternative selectors if no results found
    if (results.length === 0) {
      $('a[href*="/detail/"]').each((i, elem) => {
        const $link = $(elem);
        const link = $link.attr('href');
        const title = $link.attr('title') || $link.find('.titit').text().trim() || $link.text().trim();
        const image = $link.find('img').first().attr('src');

        if (title && link && title.length > 3) {
          const slug = extractSlug(link);

          results.push({
            title: title.split('\n')[0].trim(),
            slug: slug,
            url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
            image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null
          });
        }
      });
    }

    return {
      page: pageNum,
      results
    };
  } catch (error) {
    throw new Error(`Failed to scrape ongoing: ${error.message}`);
  }
};

// Scrape complete/ended series
export const scrapeComplete = async (page = 1) => {
  try {
    const pageNum = parseInt(page) || 1;
    const completeUrl = `${BASE_URL}/all?page=${pageNum}&status=ended&year=c2d0de&genre=c2d0de&country=c2d0de&media_type=c2d0de`;
    const $ = await fetchHTML(completeUrl);
    const results = [];

    // Reuse same structure as search/ongoing
    $('.card.mx-auto').each((i, elem) => {
      const $card = $(elem);
      const $link = $card.find('a.poster').first();
      const link = $link.attr('href');

      if (!link) return;

      const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
      const image = $card.find('img.poster').first().attr('src') ||
        $card.find('img.poster').first().attr('data-src');
      const duration = $card.find('.type.TV, .type.Movie').first().text().trim();

      // Episode from .tagw .qua
      let episode = null;
      const $tagw = $card.find('.tagw');
      if ($tagw.length > 0) {
        const $qua = $tagw.find('.qua');
        if ($qua.length > 0) {
          episode = $qua.first().text().trim();

          $qua.each((j, quaElem) => {
            const quaText = $(quaElem).text().trim();
            if (quaText.match(/E\d+/i) && !episode.match(/E\d+/i)) {
              episode = quaText;
            } else if (quaText === 'WEB' && episode && !episode.match(/E\d+/i)) {
              episode = quaText;
            }
          });
        }
      }

      if (!episode) {
        episode = $card.find('.rate').first().text().trim() || null;
      }

      // Rating
      let rating = null;
      const $rat = $card.find('.rat');
      if ($rat.length > 0) {
        const ratingText = $rat.first().text().trim();
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]).toString();
        }
      }

      // Quality
      let quality = null;
      const $titit = $card.find('.titit');
      if ($titit.length > 0) {
        const $qualitySpan = $titit.find('span').first();
        if ($qualitySpan.length > 0) {
          const qualityText = $qualitySpan.text().trim();
          if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
            quality = qualityText;
          }
        }
      }

      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;

      if (title && link) {
        const slug = extractSlug(link);

        results.push({
          title,
          slug: slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          episode: episode || null,
          duration: duration || null,
          quality: quality || null,
          rating: rating || null,
          year: year || null
        });
      }
    });

    // Fallback if no .card.mx-auto found
    if (results.length === 0) {
      $('a[href*="/detail/"]').each((i, elem) => {
        const $link = $(elem);
        const link = $link.attr('href');
        const title = $link.attr('title') || $link.find('.titit').text().trim() || $link.text().trim();
        const image = $link.find('img').first().attr('src');

        if (title && link && title.length > 3) {
          const slug = extractSlug(link);

          results.push({
            title: title.split('\n')[0].trim(),
            slug: slug,
            url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
            image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null
          });
        }
      });
    }

    return {
      page: pageNum,
      results
    };
  } catch (error) {
    throw new Error(`Failed to scrape complete: ${error.message}`);
  }
};

// Scrape TV series (media_type=tv)
export const scrapeSeries = async (page = 1) => {
  try {
    const pageNum = parseInt(page) || 1;
    const seriesUrl = `${BASE_URL}/all?page=${pageNum}&media_type=tv&year=c2d0de&genre=c2d0de&country=c2d0de`;
    const $ = await fetchHTML(seriesUrl);
    const results = [];

    $('.card.mx-auto').each((i, elem) => {
      const $card = $(elem);
      const $link = $card.find('a.poster').first();
      const link = $link.attr('href');
      if (!link) return;

      const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
      const image = $card.find('img.poster').first().attr('src') ||
        $card.find('img.poster').first().attr('data-src');
      const duration = $card.find('.type.TV, .type.Movie').first().text().trim();

      // Episode
      let episode = null;
      const $tagw = $card.find('.tagw');
      if ($tagw.length > 0) {
        const $qua = $tagw.find('.qua');
        if ($qua.length > 0) {
          episode = $qua.first().text().trim();
          $qua.each((j, quaElem) => {
            const quaText = $(quaElem).text().trim();
            if (quaText.match(/E\d+/i) && !episode.match(/E\d+/i)) {
              episode = quaText;
            } else if (quaText === 'WEB' && episode && !episode.match(/E\d+/i)) {
              episode = quaText;
            }
          });
        }
      }
      if (!episode) {
        episode = $card.find('.rate').first().text().trim() || null;
      }

      // Rating
      let rating = null;
      const $rat = $card.find('.rat');
      if ($rat.length > 0) {
        const ratingText = $rat.first().text().trim();
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]).toString();
        }
      }

      // Quality
      let quality = null;
      const $titit = $card.find('.titit');
      if ($titit.length > 0) {
        const $qualitySpan = $titit.find('span').first();
        if ($qualitySpan.length > 0) {
          const qualityText = $qualitySpan.text().trim();
          if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
            quality = qualityText;
          }
        }
      }

      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;

      if (title && link) {
        const slug = extractSlug(link);
        results.push({
          title,
          slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          episode: episode || null,
          duration: duration || null,
          quality: quality || null,
          rating: rating || null,
          year: year || null
        });
      }
    });

    if (results.length === 0) {
      $('a[href*="/detail/"]').each((i, elem) => {
        const $link = $(elem);
        const link = $link.attr('href');
        const title = $link.attr('title') || $link.find('.titit').text().trim() || $link.text().trim();
        const image = $link.find('img').first().attr('src');
        if (title && link && title.length > 3) {
          const slug = extractSlug(link);
          results.push({
            title: title.split('\n')[0].trim(),
            slug,
            url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
            image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null
          });
        }
      });
    }

    return {
      page: pageNum,
      results
    };
  } catch (error) {
    throw new Error(`Failed to scrape series: ${error.message}`);
  }
};

// Scrape movies (media_type=movie)
export const scrapeMovie = async (page = 1) => {
  try {
    const pageNum = parseInt(page) || 1;
    const movieUrl = `${BASE_URL}/all?page=${pageNum}&media_type=movie&year=c2d0de&genre=c2d0de&country=c2d0de`;
    const $ = await fetchHTML(movieUrl);
    const results = [];

    $('.card.mx-auto').each((i, elem) => {
      const $card = $(elem);
      const $link = $card.find('a.poster').first();
      const link = $link.attr('href');
      if (!link) return;

      const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
      const image = $card.find('img.poster').first().attr('src') ||
        $card.find('img.poster').first().attr('data-src');
      const duration = $card.find('.type.TV, .type.Movie').first().text().trim();

      // Episode (for movies usually null, but keep same logic)
      let episode = null;
      const $tagw = $card.find('.tagw');
      if ($tagw.length > 0) {
        const $qua = $tagw.find('.qua');
        if ($qua.length > 0) {
          episode = $qua.first().text().trim();
          $qua.each((j, quaElem) => {
            const quaText = $(quaElem).text().trim();
            if (quaText.match(/E\d+/i) && !episode.match(/E\d+/i)) {
              episode = quaText;
            } else if (quaText === 'WEB' && episode && !episode.match(/E\d+/i)) {
              episode = quaText;
            }
          });
        }
      }
      if (!episode) {
        episode = $card.find('.rate').first().text().trim() || null;
      }

      // Rating
      let rating = null;
      const $rat = $card.find('.rat');
      if ($rat.length > 0) {
        const ratingText = $rat.first().text().trim();
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]).toString();
        }
      }

      // Quality
      let quality = null;
      const $titit = $card.find('.titit');
      if ($titit.length > 0) {
        const $qualitySpan = $titit.find('span').first();
        if ($qualitySpan.length > 0) {
          const qualityText = $qualitySpan.text().trim();
          if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
            quality = qualityText;
          }
        }
      }

      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;

      if (title && link) {
        const slug = extractSlug(link);
        results.push({
          title,
          slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          episode: episode || null,
          duration: duration || null,
          quality: quality || null,
          rating: rating || null,
          year: year || null
        });
      }
    });

    if (results.length === 0) {
      $('a[href*="/detail/"]').each((i, elem) => {
        const $link = $(elem);
        const link = $link.attr('href');
        const title = $link.attr('title') || $link.find('.titit').text().trim() || $link.text().trim();
        const image = $link.find('img').first().attr('src');
        if (title && link && title.length > 3) {
          const slug = extractSlug(link);
          results.push({
            title: title.split('\n')[0].trim(),
            slug,
            url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
            image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null
          });
        }
      });
    }

    return {
      page: pageNum,
      results
    };
  } catch (error) {
    throw new Error(`Failed to scrape movie: ${error.message}`);
  }
};

// Scrape search results
export const scrapeSearch = async (query) => {
  try {
    // Use the correct search URL: /all?q=query
    const searchUrl = `${BASE_URL}/all?q=${encodeURIComponent(query)}`;
    const $ = await fetchHTML(searchUrl);
    const results = [];

    // Use the same structure as home page - .card.mx-auto
    $('.card.mx-auto').each((i, elem) => {
      const $card = $(elem);
      const $link = $card.find('a.poster').first();
      const link = $link.attr('href');

      if (!link) return;

      const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
      const image = $card.find('img.poster').first().attr('src') ||
        $card.find('img.poster').first().attr('data-src');
      const duration = $card.find('.type.TV, .type.Movie').first().text().trim();

      // Get episode from .tagw .qua (focus on this)
      let episode = null;
      const $tagw = $card.find('.tagw');
      if ($tagw.length > 0) {
        const $qua = $tagw.find('.qua');
        if ($qua.length > 0) {
          // Get episode text from .qua
          episode = $qua.first().text().trim();

          // Also check if there are multiple .qua elements (might have different info)
          $qua.each((j, quaElem) => {
            const quaText = $(quaElem).text().trim();
            const quaStyle = $(quaElem).attr('style') || '';

            // Prioritize episode info (E2/16, E16 END, etc) over WEB
            if (quaText.match(/E\d+/i) && !episode.match(/E\d+/i)) {
              episode = quaText;
            } else if (quaText === 'WEB' && episode && !episode.match(/E\d+/i)) {
              // Keep WEB only if no episode number found
              episode = quaText;
            }
          });
        }
      }

      // Fallback: try .rate if .tagw not found
      if (!episode) {
        episode = $card.find('.rate').first().text().trim() || null;
      }

      // Get rating from .rat (format: <i class="fa fa-star"></i> 8.2)
      let rating = null;
      const $rat = $card.find('.rat');
      if ($rat.length > 0) {
        const ratingText = $rat.first().text().trim();
        // Extract number from rating text
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]).toString();
        }
      }

      // Get quality from .titit span (first span usually contains quality)
      let quality = null;
      const $titit = $card.find('.titit');
      if ($titit.length > 0) {
        const $qualitySpan = $titit.find('span').first();
        if ($qualitySpan.length > 0) {
          const qualityText = $qualitySpan.text().trim();
          // Skip if it's a date (contains "tahun" or "yang lalu")
          if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
            quality = qualityText;
          }
        }
      }

      // Try to extract year from title (common pattern: "Title (2024)")
      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;

      if (title && link) {
        // Extract slug (path/directory only)
        const slug = extractSlug(link);

        results.push({
          title,
          slug: slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          episode: episode || null,
          duration: duration || null,
          quality: quality || null,
          rating: rating || null,
          year: year || null
        });
      }
    });

    // Fallback: try alternative selectors if no results found
    if (results.length === 0) {
      // Try finding links with /detail/ pattern
      $('a[href*="/detail/"]').each((i, elem) => {
        const $link = $(elem);
        const link = $link.attr('href');
        const title = $link.attr('title') || $link.find('.titit').text().trim() || $link.text().trim();
        const image = $link.find('img').first().attr('src');

        if (title && link && title.length > 3) {
          // Extract slug (path/directory only)
          const slug = extractSlug(link);

          results.push({
            title: title.split('\n')[0].trim(),
            slug: slug,
            url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
            image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null
          });
        }
      });
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to scrape search: ${error.message}`);
  }
};

// Scrape search results for ongoing series
export const scrapeSearchOngoing = async (query) => {
  try {
    // Combine query with ongoing status (returning series)
    const searchUrl = `${BASE_URL}/all?q=${encodeURIComponent(query)}&status=returning%20series`;
    const $ = await fetchHTML(searchUrl);
    const results = [];

    // Use the same structure as home page - .card.mx-auto
    $('.card.mx-auto').each((i, elem) => {
      const $card = $(elem);
      const $link = $card.find('a.poster').first();
      const link = $link.attr('href');

      if (!link) return;

      const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
      const image = $card.find('img.poster').first().attr('src') ||
        $card.find('img.poster').first().attr('data-src');
      const duration = $card.find('.type.TV, .type.Movie').first().text().trim();

      // Get episode from .tagw .qua (focus on this)
      let episode = null;
      const $tagw = $card.find('.tagw');
      if ($tagw.length > 0) {
        const $qua = $tagw.find('.qua');
        if ($qua.length > 0) {
          // Get episode text from .qua
          episode = $qua.first().text().trim();

          // Also check if there are multiple .qua elements (might have different info)
          $qua.each((j, quaElem) => {
            const quaText = $(quaElem).text().trim();

            // Prioritize episode info (E2/16, E16 END, etc) over WEB
            if (quaText.match(/E\d+/i) && !episode.match(/E\d+/i)) {
              episode = quaText;
            } else if (quaText === 'WEB' && episode && !episode.match(/E\d+/i)) {
              // Keep WEB only if no episode number found
              episode = quaText;
            }
          });
        }
      }

      // Fallback: try .rate if .tagw not found
      if (!episode) {
        episode = $card.find('.rate').first().text().trim() || null;
      }

      // Get rating from .rat (format: <i class="fa fa-star"></i> 8.2)
      let rating = null;
      const $rat = $card.find('.rat');
      if ($rat.length > 0) {
        const ratingText = $rat.first().text().trim();
        // Extract number from rating text
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]).toString();
        }
      }

      // Get quality from .titit span (first span usually contains quality)
      let quality = null;
      const $titit = $card.find('.titit');
      if ($titit.length > 0) {
        const $qualitySpan = $titit.find('span').first();
        if ($qualitySpan.length > 0) {
          const qualityText = $qualitySpan.text().trim();
          // Skip if it's a date (contains "tahun" or "yang lalu")
          if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
            quality = qualityText;
          }
        }
      }

      // Try to extract year from title (common pattern: "Title (2024)")
      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;

      if (title && link) {
        // Extract slug (path/directory only)
        const slug = extractSlug(link);

        results.push({
          title,
          slug: slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          episode: episode || null,
          duration: duration || null,
          quality: quality || null,
          rating: rating || null,
          year: year || null
        });
      }
    });

    // Fallback: try alternative selectors if no results found
    if (results.length === 0) {
      // Try finding links with /detail/ pattern
      $('a[href*="/detail/"]').each((i, elem) => {
        const $link = $(elem);
        const link = $link.attr('href');
        const title = $link.attr('title') || $link.find('.titit').text().trim() || $link.text().trim();
        const image = $link.find('img').first().attr('src');

        if (title && link && title.length > 3) {
          // Extract slug (path/directory only)
          const slug = extractSlug(link);

          results.push({
            title: title.split('\n')[0].trim(),
            slug: slug,
            url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
            image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null
          });
        }
      });
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to scrape search ongoing: ${error.message}`);
  }
};

// Get episodes from detail page
const getEpisodesFromDetail = async (detailUrl) => {
  try {
    const $ = await fetchHTML(detailUrl);
    const episodes = [];

    // Find movie_id from loadEpisode onclick
    // Example: onclick="loadEpisode('kFvLXwIzm5','708aab6f6553a34f80509a8f906eb0b7')"
    let movieId = null;
    let tag = null;

    $('a[onclick*="loadEpisode"], button[onclick*="loadEpisode"], .pagination a[onclick*="loadEpisode"]').each((i, elem) => {
      const $elem = $(elem);
      const onclick = $elem.attr('onclick') || '';
      const paramsMatch = onclick.match(/loadEpisode\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/);
      if (paramsMatch && !movieId) {
        movieId = paramsMatch[1]; // First parameter (kFvLXwIzm5)
        tag = paramsMatch[2]; // Second parameter (708aab6f6553a34f80509a8f906eb0b7)
        return false; // Break loop
      }
    });

    // If movie_id found, hit episode API
    if (movieId && tag) {
      try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const episodeApiUrl = `https://xdrakor3.nicewap.sbs/c_api/episode.php?is_mob=0&is_uc=0&movie_id=${movieId}&tag=${tag}&t=${timestamp}&ver=1.0`;

        const response = await axios.get(episodeApiUrl, {
          headers: getHeaders(),
          timeout: 30000
        });

        const apiData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

        if (apiData.episode_lists) {
          // Parse episode_lists HTML
          const $episodeList = cheerio.load(apiData.episode_lists);

          $episodeList('a.btn-svr').each((i, elem) => {
            const $epLink = $episodeList(elem);
            const onclick = $epLink.attr('onclick') || '';
            const episodeText = $epLink.text().trim();

            // Extract episode slug from loadServer('bLztoVPGeBmA','708aab6f6553a34f80509a8f906eb0b7','server_loc','f1')
            const serverMatch = onclick.match(/loadServer\(['"]([^'"]+)['"]/);
            if (serverMatch) {
              const episodeSlug = serverMatch[1];
              const episodeNum = episodeText;

              episodes.push({
                name: `Episode ${episodeNum}`,
                slug: episodeSlug
              });
            }
          });

          // Sort episodes by episode number (ascending)
          episodes.sort((a, b) => {
            const numA = parseInt(a.name.match(/\b(\d+)\b/)?.[1]) || 0;
            const numB = parseInt(b.name.match(/\b(\d+)\b/)?.[1]) || 0;
            return numA - numB;
          });

          // Fetch p2p_url for each episode from video_p2p.php API
          const finalEpisodes = [];
          for (const ep of episodes) {
            try {
              const timestamp = Math.floor(Date.now() / 1000).toString();
              const videoApiUrl = `https://drakorindo49.kita.cam/c_api/video_p2p.php?is_mob=0&is_uc=0&id=${ep.slug}&qua=web&res=480&server_id=f1&tag=${tag}&t=${timestamp}&ver=1.0`;

              const videoResponse = await axios.get(videoApiUrl, {
                headers: getHeaders(),
                timeout: 30000
              });

              const videoData = typeof videoResponse.data === 'string' ? JSON.parse(videoResponse.data) : videoResponse.data;

              // Replace slug with p2p_url if available
              const finalSlug = videoData.p2p_url || ep.slug;

              finalEpisodes.push({
                name: ep.name,
                slug: finalSlug
              });
            } catch (err) {
              // If fetching fails, keep original slug
              console.error(`Failed to fetch p2p_url for episode ${ep.name}:`, err.message);
              finalEpisodes.push({
                name: ep.name,
                slug: ep.slug
              });
            }
          }

          // Replace episodes array with final episodes
          episodes.length = 0;
          episodes.push(...finalEpisodes);
        }
      } catch (err) {
        console.error('Failed to fetch episode list from API:', err.message);
      }
    }

    return episodes;
  } catch (error) {
    console.error('Failed to get episodes from detail:', error.message);
    return [];
  }
};

// Scrape drama detail
export const scrapeDetail = async (slug) => {
  try {
    // Ensure slug starts with / and build full URL
    // Remove /detail/ if already present to avoid duplication
    let cleanSlug = slug.startsWith('/') ? slug : `/${slug}`;
    let finalSlug = cleanSlug;

    if (!cleanSlug.startsWith('/detail/')) {
      // Add /detail/ prefix if not present
      finalSlug = cleanSlug.startsWith('/') ? `/detail${cleanSlug}` : `/detail/${cleanSlug}`;
    }

    const fullUrl = `${BASE_URL}${finalSlug}`;
    const $ = await fetchHTML(fullUrl);

    // Raw page title (for episode/quality parsing)
    const rawPageTitle = $('title').text().trim();

    // Get title - try multiple selectors, fallback to cleaned raw title
    const title = $('title').first().text().trim() ||
      $('.entry-title').first().text().trim() ||
      rawPageTitle.replace('Nonton', '').replace('Subtitle Indonesia', '').trim();

    // Get image - try poster class first
    const image = $('img.side-poster').first().attr('src') ||
      $('.poster img').first().attr('src') ||
      $('.thumbnail img').first().attr('src') ||
      $('.featured-image img').first().attr('src') ||
      $('img[alt*="' + title.substring(0, 20) + '"]').first().attr('src');

    // Get description - look for common description containers
    let description = $('.description').first().text().trim() ||
      $('.synopsis').first().text().trim() ||
      $('.content').first().text().trim() ||
      $('.entry-content').first().text().trim() ||
      $('.sinopsis').first().text().trim();

    // Clean description (remove extra whitespace)
    if (description) {
      description = description.replace(/\s+/g, ' ').trim();
    }

    // Get genre from .gnr a
    const genre = [];
    $('.gnr a').each((i, elem) => {
      const genreText = $(elem).text().trim();
      if (genreText && !genre.includes(genreText)) {
        genre.push(genreText);
      }
    });

    // Fallback to other genre selectors if .gnr not found
    if (genre.length === 0) {
      $('.genre a, .category a, .tag a, [class*="genre"] a').each((i, elem) => {
        const genreText = $(elem).text().trim();
        if (genreText && !genre.includes(genreText)) {
          genre.push(genreText);
        }
      });
    }

    // Get info from various info sections (key-value meta)
    const info = {};

    // Try to extract info from common patterns
    $('.info, .meta, [class*="info"]').each((i, elem) => {
      const $elem = $(elem);
      const text = $elem.text();
      // Look for patterns like "Year: 2024", "Status: Ongoing", etc.
      const matches = text.match(/(\w+):\s*([^\n]+)/g);
      if (matches) {
        matches.forEach(match => {
          const [label, value] = match.split(':').map(s => s.trim());
          if (label && value) {
            info[label.toLowerCase()] = value;
          }
        });
      }
    });

    // Derive year (prefer explicit info.year, then title, then page body)
    let year = null;
    if (info.year) {
      year = info.year;
    } else {
      const yearMatchFromTitle = title.match(/\((\d{4})\)/);
      const yearMatchFromBody = $('body').text().match(/\b(19|20)\d{2}\b/);
      if (yearMatchFromTitle) {
        year = yearMatchFromTitle[1];
      } else if (yearMatchFromBody) {
        year = yearMatchFromBody[0];
      }
    }

    // Get episodes/watch link - look for common patterns (for client navigation)
    const episodesLink = $('a[href*="episode"]').first().attr('href') ||
      $('a[href*="watch"]').first().attr('href') ||
      $('.episode-list a').first().attr('href') ||
      $('a:contains("Episode")').first().attr('href') ||
      $('a:contains("Nonton")').first().attr('href');

    let episodesSlug = null;
    if (episodesLink) {
      episodesSlug = extractSlug(episodesLink);
    } else {
      episodesSlug = finalSlug;
    }

    // Derive episode info from raw page title (same style as popular)
    let episode = null;
    const episodeRangeMatch = rawPageTitle.match(/\[Episode\s+(\d+)\s*-\s*(\d+)\]/i);
    if (episodeRangeMatch) {
      const firstEp = parseInt(episodeRangeMatch[1], 10);
      const lastEp = parseInt(episodeRangeMatch[2], 10);
      if (!Number.isNaN(firstEp) && !Number.isNaN(lastEp)) {
        episode = firstEp === 1 ? `E${lastEp}/${lastEp}` : `E${firstEp}/${lastEp}`;
      }
    } else {
      const singleEpMatch = rawPageTitle.match(/Episode\s+(\d+)/i) || rawPageTitle.match(/\bE\s*(\d+)\b/i);
      if (singleEpMatch) {
        const epNum = parseInt(singleEpMatch[1], 10);
        episode = !Number.isNaN(epNum) ? `E${epNum}` : null;
      }
    }
    if (!episode) {
      // Default when nothing found
      episode = '1';
    }

    // Derive duration from info or explicit "Video Length"
    let duration = null;
    if (info['video length']) {
      duration = info['video length'];
    } else {
      $('li').each((_, liElem) => {
        const text = $(liElem).text().trim();
        if (text.toLowerCase().includes('video length') || text.toLowerCase().includes('length')) {
          const m = text.match(/(\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2})/);
          if (m) {
            duration = m[1];
          }
        }
      });
    }

    // Derive quality from raw page title (handle WEB-DL etc.)
    let quality = null;
    const bracketIndex = rawPageTitle.indexOf(']');
    if (bracketIndex !== -1) {
      const afterBracket = rawPageTitle.substring(bracketIndex + 1).trim();
      const qualityMatch = afterBracket.match(/^((?:WEB-DL|WEBRip|BluRay|HDTV|DVDRip|BRRip|TS|CAM|R5|TC|SCR|DVDSCR|R6|PDTV|SDTV|HDTVRip|WEBRip|BDRip|HDRip|UHD|4K|8K)\s*)?([\d\s,p&]+?p[\d\s,p&]*?)(?:\s*(?:Sub\s*(?:Indo|Indonesia|title)?|DrakorKita|\s*-\s*DrakorKita))/i);
      if (qualityMatch) {
        const prefix = (qualityMatch[1] || '').trim();
        const qText = (qualityMatch[2] || '').trim();
        quality = `${prefix} ${qText}`.trim().replace(/\s+/g, ' ');
      } else {
        const fallbackMatch = afterBracket.match(/^((?:WEB-DL|WEBRip|BluRay|HDTV|DVDRip|BRRip|TS|CAM|R5|TC|SCR|DVDSCR|R6|PDTV|SDTV|HDTVRip|WEBRip|BDRip|HDRip|UHD|4K|8K)\s*)?([\d\s,p&]+?p[\d\s,p&]*?)(?:\s|$)/i);
        if (fallbackMatch) {
          const prefix = (fallbackMatch[1] || '').trim();
          const qText = (fallbackMatch[2] || '').trim();
          quality = `${prefix} ${qText}`.trim().replace(/\s+/g, ' ');
        }
      }
    } else {
      const yearMatchInTitle = rawPageTitle.match(/\((\d{4})\)/);
      if (yearMatchInTitle) {
        const yearEndIndex = rawPageTitle.indexOf(')', yearMatchInTitle.index);
        const afterYear = rawPageTitle.substring(yearEndIndex + 1).trim();
        const qualityMatch = afterYear.match(/^((?:WEB-DL|WEBRip|BluRay|HDTV|DVDRip|BRRip|TS|CAM|R5|TC|SCR|DVDSCR|R6|PDTV|SDTV|HDTVRip|WEBRip|BDRip|HDRip|UHD|4K|8K)\s*)?([\d\s,p&]+?p[\d\s,p&]*?)(?:\s*(?:Sub\s*(?:Indo|Indonesia|title)?|DrakorKita|\s*-\s*DrakorKita))/i);
        if (qualityMatch) {
          const prefix = (qualityMatch[1] || '').trim();
          const qText = (qualityMatch[2] || '').trim();
          quality = `${prefix} ${qText}`.trim().replace(/\s+/g, ' ');
        } else {
          const fallbackMatch = afterYear.match(/^((?:WEB-DL|WEBRip|BluRay|HDTV|DVDRip|BRRip|TS|CAM|R5|TC|SCR|DVDSCR|R6|PDTV|SDTV|HDTVRip|WEBRip|BDRip|HDRip|UHD|4K|8K)\s*)?([\d\s,p&]+?p[\d\s,p&]*?)(?:\s|$)/i);
          if (fallbackMatch) {
            const prefix = (fallbackMatch[1] || '').trim();
            const qText = (fallbackMatch[2] || '').trim();
            quality = `${prefix} ${qText}`.trim().replace(/\s+/g, ' ');
          }
        }
      }
    }

    // Get producer (director) from <li><span><b>Director</b>: ...</span></li>
    let producer = null;
    $('li').each((_, liElem) => {
      const $li = $(liElem);
      const text = $li.text().trim();
      if (text.toLowerCase().includes('director')) {
        const $span = $li.find('span');
        if ($span.length > 0) {
          const directorMatch = $span.text().match(/Director\s*:\s*(.+)/i);
          if (directorMatch) {
            const directorText = directorMatch[1].trim();
            // Extract director name from link or text
            const $directorLink = $span.find('a');
            if ($directorLink.length > 0) {
              producer = $directorLink.text().trim();
            } else {
              producer = directorText;
            }
          }
        }
      }
    });

    // Get release date from <li><span><b>First Air Date</b>: ...</span></li>
    let releaseDate = null;
    $('li').each((_, liElem) => {
      const $li = $(liElem);
      const text = $li.text().trim();
      if (text.toLowerCase().includes('first air date')) {
        const $span = $li.find('span');
        if ($span.length > 0) {
          const dateMatch = $span.text().match(/First Air Date\s*:\s*(.+)/i);
          if (dateMatch) {
            // Remove sup tags and clean up
            releaseDate = dateMatch[1].replace(/<sup[^>]*>.*?<\/sup>/gi, '').trim();
          }
        }
      }
    });

    // Get status from <li class="nav-link..."><a href="/all?status=...">...</a></li>
    let status = null;
    $('li.nav-link a[href*="status="]').each((_, elem) => {
      const $link = $(elem);
      const href = $link.attr('href') || '';
      const statusMatch = href.match(/status=([^&]+)/);
      if (statusMatch) {
        status = decodeURIComponent(statusMatch[1].replace(/\+/g, ' '));
      } else {
        // Fallback to link text
        const linkText = $link.text().trim();
        if (linkText) {
          status = linkText;
        }
      }
    });

    // Get rating from .rt .rating strong (Score: 8)
    let rating = null;
    const $ratingStrong = $('.rt .rating strong');
    if ($ratingStrong.length > 0) {
      const ratingText = $ratingStrong.text().trim();
      const scoreMatch = ratingText.match(/Score\s*:\s*(\d+(?:\.\d+)?)/i);
      if (scoreMatch) {
        rating = scoreMatch[1];
      }
    }

    return {
      // Same shape as items from /api/series, plus extra metadata
      title: title || null,
      slug: finalSlug,
      url: fullUrl,
      image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
      episode: episode || null,
      duration: duration || null,
      quality: quality || null,
      rating,
      year: year || null,
      // extra fields for richer detail
      description: description || null,
      genres: genre.length > 0 ? genre.map(name => ({ slug: generateSlugFromTitle(name), name })) : null,
      producer: producer || null,
      releaseDate: releaseDate || null,
      status: status || null,
      info: Object.keys(info).length > 0 ? info : null,
      episodes: await getEpisodesFromDetail(fullUrl)
    };
  } catch (error) {
    throw new Error(`Failed to scrape detail: ${error.message}`);
  }
};

// Scrape streaming URL from episode page
export const scrapeStreamingUrl = async (slug) => {
  try {
    // Ensure slug starts with / and build full URL
    const cleanSlug = slug.startsWith('/') ? slug : `/${slug}`;
    const fullUrl = `${BASE_URL}/detail/${cleanSlug}`;
    const $ = await fetchHTML(fullUrl);

    const streamingData = {
      sources: [],
      iframes: [],
      players: []
    };

    // 1. Find iframe sources (common for embedded players)
    $('iframe').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (src && (src.includes('http') || src.startsWith('//'))) {
        const iframeUrl = src.startsWith('//') ? `https:${src}` : src;
        streamingData.iframes.push({
          type: 'iframe',
          url: iframeUrl,
          width: $(elem).attr('width') || null,
          height: $(elem).attr('height') || null
        });
      }
    });

    // 2. Find video tags
    $('video').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      const poster = $(elem).attr('poster');

      if (src) {
        const videoUrl = src.startsWith('//') ? `https:${src}` :
          src.startsWith('http') ? src :
            `${BASE_URL}${src}`;

        streamingData.sources.push({
          type: 'video',
          url: videoUrl,
          quality: $(elem).attr('data-quality') || null,
          poster: poster ? (poster.startsWith('http') ? poster : `${BASE_URL}${poster}`) : null
        });
      }

      // Check for source tags inside video
      $(elem).find('source').each((j, source) => {
        const sourceSrc = $(source).attr('src');
        const sourceType = $(source).attr('type');
        if (sourceSrc) {
          const sourceUrl = sourceSrc.startsWith('//') ? `https:${sourceSrc}` :
            sourceSrc.startsWith('http') ? sourceSrc :
              `${BASE_URL}${sourceSrc}`;

          streamingData.sources.push({
            type: 'video',
            url: sourceUrl,
            mimeType: sourceType || null,
            quality: $(source).attr('data-quality') || null
          });
        }
      });
    });

    // 3. Find embed/object tags
    $('embed, object').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data');
      if (src) {
        const embedUrl = src.startsWith('//') ? `https:${src}` :
          src.startsWith('http') ? src :
            `${BASE_URL}${src}`;

        streamingData.players.push({
          type: $(elem).prop('tagName').toLowerCase(),
          url: embedUrl
        });
      }
    });

    // 4. Look for common streaming URL patterns in script tags
    const scripts = $('script').toArray();
    for (const script of scripts) {
      const scriptContent = $(script).html() || '';

      // Look for common video URL patterns
      const patterns = [
        /(?:src|url|source|file)\s*[:=]\s*["']([^"']+\.(?:mp4|m3u8|webm|mkv|flv|avi))["']/gi,
        /(?:src|url|source|file)\s*[:=]\s*["'](https?:\/\/[^"']+)["']/gi,
        /player\.load\(["']([^"']+)["']/gi,
        /jwplayer\([^)]+\)\.setup\([^}]+file["']?\s*:\s*["']([^"']+)["']/gi,
        /videojs\([^)]+\)\.src\(["']([^"']+)["']/gi
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(scriptContent)) !== null) {
          const url = match[1];
          if (url && (url.includes('http') || url.includes('.mp4') || url.includes('.m3u8'))) {
            const cleanUrl = url.startsWith('//') ? `https:${url}` : url;
            if (!streamingData.sources.some(s => s.url === cleanUrl)) {
              streamingData.sources.push({
                type: 'video',
                url: cleanUrl,
                source: 'script'
              });
            }
          }
        }
      });
    }

    // 5. Look for data attributes that might contain video URLs
    $('[data-video], [data-src], [data-url], [data-file]').each((i, elem) => {
      const $elem = $(elem);
      const videoUrl = $elem.attr('data-video') ||
        $elem.attr('data-src') ||
        $elem.attr('data-url') ||
        $elem.attr('data-file');

      if (videoUrl && (videoUrl.includes('http') || videoUrl.includes('.mp4') || videoUrl.includes('.m3u8'))) {
        const cleanUrl = videoUrl.startsWith('//') ? `https:${videoUrl}` :
          videoUrl.startsWith('http') ? videoUrl :
            `${BASE_URL}${videoUrl}`;

        if (!streamingData.sources.some(s => s.url === cleanUrl)) {
          streamingData.sources.push({
            type: 'video',
            url: cleanUrl,
            source: 'data-attribute'
          });
        }
      }
    });

    // 6. Look for links that might be streaming URLs
    $('a[href*=".mp4"], a[href*=".m3u8"], a[href*="watch"], a[href*="stream"], a[href*="play"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.includes('http')) {
        const cleanUrl = href.startsWith('//') ? `https:${href}` : href;
        if (!streamingData.sources.some(s => s.url === cleanUrl)) {
          streamingData.sources.push({
            type: 'link',
            url: cleanUrl,
            title: $(elem).text().trim() || null
          });
        }
      }
    });

    // Return primary streaming URL (first found) and all sources
    return {
      primary: streamingData.sources[0]?.url ||
        streamingData.iframes[0]?.url ||
        streamingData.players[0]?.url ||
        null,
      all: {
        sources: streamingData.sources,
        iframes: streamingData.iframes,
        players: streamingData.players
      },
      slug: cleanSlug,
      url: fullUrl
    };
  } catch (error) {
    throw new Error(`Failed to scrape streaming URL: ${error.message}`);
  }
};

// Scrape search results for series (TV)
export const scrapeSearchSeries = async (query) => {
  try {
    const searchUrl = `${BASE_URL}/all?q=${encodeURIComponent(query)}&media_type=tv`;
    const $ = await fetchHTML(searchUrl);
    const results = [];

    $('.card.mx-auto').each((i, elem) => {
      const $card = $(elem);
      const $link = $card.find('a.poster').first();
      const link = $link.attr('href');

      if (!link) return;

      const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
      const image = $card.find('img.poster').first().attr('src') ||
        $card.find('img.poster').first().attr('data-src');
      const duration = $card.find('.type.TV, .type.Movie').first().text().trim();

      let episode = null;
      const $tagw = $card.find('.tagw');
      if ($tagw.length > 0) {
        const $qua = $tagw.find('.qua');
        if ($qua.length > 0) {
          episode = $qua.first().text().trim();
          $qua.each((j, quaElem) => {
            const quaText = $(quaElem).text().trim();
            if (quaText.match(/E\d+/i) && !episode.match(/E\d+/i)) {
              episode = quaText;
            } else if (quaText === 'WEB' && episode && !episode.match(/E\d+/i)) {
              episode = quaText;
            }
          });
        }
      }
      if (!episode) {
        episode = $card.find('.rate').first().text().trim() || null;
      }

      let rating = null;
      const $rat = $card.find('.rat');
      if ($rat.length > 0) {
        const ratingText = $rat.first().text().trim();
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]).toString();
        }
      }

      let quality = null;
      const $titit = $card.find('.titit');
      if ($titit.length > 0) {
        const $qualitySpan = $titit.find('span').first();
        if ($qualitySpan.length > 0) {
          const qualityText = $qualitySpan.text().trim();
          if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
            quality = qualityText;
          }
        }
      }

      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;

      if (title && link) {
        const slug = extractSlug(link);
        results.push({
          title,
          slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          episode: episode || null,
          duration: duration || null,
          quality: quality || null,
          rating: rating || null,
          year: year || null
        });
      }
    });

    if (results.length === 0) {
      $('a[href*="/detail/"]').each((i, elem) => {
        const $link = $(elem);
        const link = $link.attr('href');
        const title = $link.attr('title') || $link.find('.titit').text().trim() || $link.text().trim();
        const image = $link.find('img').first().attr('src');
        if (title && link && title.length > 3) {
          const slug = extractSlug(link);
          results.push({
            title: title.split('\n')[0].trim(),
            slug,
            url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
            image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null
          });
        }
      });
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to scrape search series: ${error.message}`);
  }
};

// Scrape search results for movies
export const scrapeSearchMovie = async (query) => {
  try {
    const searchUrl = `${BASE_URL}/all?q=${encodeURIComponent(query)}&media_type=movie`;
    const $ = await fetchHTML(searchUrl);
    const results = [];

    $('.card.mx-auto').each((i, elem) => {
      const $card = $(elem);
      const $link = $card.find('a.poster').first();
      const link = $link.attr('href');

      if (!link) return;

      const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
      const image = $card.find('img.poster').first().attr('src') ||
        $card.find('img.poster').first().attr('data-src');
      const duration = $card.find('.type.TV, .type.Movie').first().text().trim();

      let episode = null;
      const $tagw = $card.find('.tagw');
      if ($tagw.length > 0) {
        const $qua = $tagw.find('.qua');
        if ($qua.length > 0) {
          episode = $qua.first().text().trim();
          $qua.each((j, quaElem) => {
            const quaText = $(quaElem).text().trim();
            if (quaText.match(/E\d+/i) && !episode.match(/E\d+/i)) {
              episode = quaText;
            } else if (quaText === 'WEB' && episode && !episode.match(/E\d+/i)) {
              episode = quaText;
            }
          });
        }
      }
      if (!episode) {
        episode = $card.find('.rate').first().text().trim() || null;
      }

      let rating = null;
      const $rat = $card.find('.rat');
      if ($rat.length > 0) {
        const ratingText = $rat.first().text().trim();
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]).toString();
        }
      }

      let quality = null;
      const $titit = $card.find('.titit');
      if ($titit.length > 0) {
        const $qualitySpan = $titit.find('span').first();
        if ($qualitySpan.length > 0) {
          const qualityText = $qualitySpan.text().trim();
          if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
            quality = qualityText;
          }
        }
      }

      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;

      if (title && link) {
        const slug = extractSlug(link);
        results.push({
          title,
          slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          episode: episode || null,
          duration: duration || null,
          quality: quality || null,
          rating: rating || null,
          year: year || null
        });
      }
    });

    if (results.length === 0) {
      $('a[href*="/detail/"]').each((i, elem) => {
        const $link = $(elem);
        const link = $link.attr('href');
        const title = $link.attr('title') || $link.find('.titit').text().trim() || $link.text().trim();
        const image = $link.find('img').first().attr('src');
        if (title && link && title.length > 3) {
          const slug = extractSlug(link);
          results.push({
            title: title.split('\n')[0].trim(),
            slug,
            url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
            image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null
          });
        }
      });
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to scrape search movie: ${error.message}`);
  }
};

// Scrape search results for complete series
export const scrapeSearchComplete = async (query) => {
  try {
    const searchUrl = `${BASE_URL}/all?q=${encodeURIComponent(query)}&status=ended`;
    const $ = await fetchHTML(searchUrl);
    const results = [];

    $('.card.mx-auto').each((i, elem) => {
      const $card = $(elem);
      const $link = $card.find('a.poster').first();
      const link = $link.attr('href');

      if (!link) return;

      const title = $card.find('.titit').first().text().trim().split('\n')[0].trim();
      const image = $card.find('img.poster').first().attr('src') ||
        $card.find('img.poster').first().attr('data-src');
      const duration = $card.find('.type.TV, .type.Movie').first().text().trim();

      let episode = null;
      const $tagw = $card.find('.tagw');
      if ($tagw.length > 0) {
        const $qua = $tagw.find('.qua');
        if ($qua.length > 0) {
          episode = $qua.first().text().trim();
          $qua.each((j, quaElem) => {
            const quaText = $(quaElem).text().trim();
            if (quaText.match(/E\d+/i) && !episode.match(/E\d+/i)) {
              episode = quaText;
            } else if (quaText === 'WEB' && episode && !episode.match(/E\d+/i)) {
              episode = quaText;
            }
          });
        }
      }
      if (!episode) {
        episode = $card.find('.rate').first().text().trim() || null;
      }

      let rating = null;
      const $rat = $card.find('.rat');
      if ($rat.length > 0) {
        const ratingText = $rat.first().text().trim();
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]).toString();
        }
      }

      let quality = null;
      const $titit = $card.find('.titit');
      if ($titit.length > 0) {
        const $qualitySpan = $titit.find('span').first();
        if ($qualitySpan.length > 0) {
          const qualityText = $qualitySpan.text().trim();
          if (!qualityText.match(/(tahun|yang lalu|lalu)/i)) {
            quality = qualityText;
          }
        }
      }

      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;

      if (title && link) {
        const slug = extractSlug(link);
        results.push({
          title,
          slug,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null,
          episode: episode || null,
          duration: duration || null,
          quality: quality || null,
          rating: rating || null,
          year: year || null
        });
      }
    });

    if (results.length === 0) {
      $('a[href*="/detail/"]').each((i, elem) => {
        const $link = $(elem);
        const link = $link.attr('href');
        const title = $link.attr('title') || $link.find('.titit').text().trim() || $link.text().trim();
        const image = $link.find('img').first().attr('src');
        if (title && link && title.length > 3) {
          const slug = extractSlug(link);
          results.push({
            title: title.split('\n')[0].trim(),
            slug,
            url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
            image: image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null
          });
        }
      });
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to scrape search complete: ${error.message}`);
  }
};