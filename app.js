// CONFIGURATION
const STORAGE_KEY = 'chiari_blog_posts';

// 1. INITIALIZE DATA 
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const initialPosts = [{
            id: Date.now(),
            title: "Welcome to Chiari Voices",
            date: new Date().toLocaleDateString(),
            author: "Admin",
            image: "assets/hope-resilience.webp", // Updated to use a local asset if available, or fallback
            content: "<p>Welcome to our new foundation blog. Here we will share stories of strength, medical updates, and community news.</p>",
            seo: {
                metaTitle: "Welcome to Chiari Voices Blog",
                description: "The official blog for the Chiari Voices Foundation.",
                primaryKeyword: "Chiari Malformation",
                secondaryKeywords: "Support, Non-profit"
            }
        }];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPosts));
    }
}

// 2. GET POSTS
function getPosts() {
    const posts = localStorage.getItem(STORAGE_KEY);
    return posts ? JSON.parse(posts) : [];
}

// 3. RENDER FEED (index.html) - UPDATED FOR TAILWIND THEME
function renderFeed() {
    const feedContainer = document.getElementById('blog-feed');
    if (!feedContainer) return;

    const posts = getPosts();
    posts.sort((a, b) => b.id - a.id); 

    if (posts.length === 0) {
        feedContainer.innerHTML = `
            <div class="col-span-full text-center text-gray-400 py-10">
                <p class="text-xl">No posts published yet.</p>
            </div>`;
        return;
    }

    feedContainer.innerHTML = posts.map(post => {
        // Use placeholder if image is missing
        const imgUrl = post.image || 'https://via.placeholder.com/800x400/2D3748/EDF2F7?text=Chiari+Voices';
        
        // Strip HTML tags for the preview snippet
        const snippet = post.content.replace(/<[^>]*>?/gm, '').substring(0, 120);

        // Tailwind-styled Card
        return `
        <article class="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:transform hover:-translate-y-2 transition-all duration-300 flex flex-col h-full group">
            <div class="relative h-48 overflow-hidden">
                <img src="${imgUrl}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="${post.title}">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </div>
            
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-center text-xs font-bold text-[var(--color-primary)] uppercase tracking-wide mb-3">
                    <span>${post.date}</span>
                    <span class="mx-2">•</span>
                    <span>${post.author}</span>
                </div>
                
                <h2 class="text-xl font-bold text-white mb-3 font-display leading-tight">${post.title}</h2>
                
                <p class="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">
                    ${snippet}...
                </p>
                
                <a href="post.html?id=${post.id}" class="inline-flex items-center text-sm font-bold text-white hover:text-[var(--color-primary)] transition-colors mt-auto group-link">
                    Read Full Article 
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 transition-transform group-link-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </a>
            </div>
        </article>
        `;
    }).join('');
}

// 4. RENDER SINGLE POST (post.html)
function renderSinglePost() {
    const contentContainer = document.getElementById('post-content');
    // If specific container not found, we might be on a different page, but check for title just in case
    if (!document.getElementById('post-title')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const post = getPosts().find(p => p.id == postId);

    if (post) {
        // A. Visual Content
        const bannerEl = document.getElementById('post-banner');
        if (bannerEl) {
            bannerEl.src = post.image || 'https://via.placeholder.com/1200x600/2D3748/EDF2F7?text=Chiari+Voices';
            bannerEl.alt = post.title;
        }
        
        const titleEl = document.getElementById('post-title');
        if(titleEl) titleEl.innerText = post.title;

        const metaEl = document.getElementById('post-meta');
        if(metaEl) metaEl.innerHTML = `<span class="text-[var(--color-primary)]">${post.date}</span> <span class="mx-2 text-gray-600">|</span> ${post.author}`;

        const bodyEl = document.getElementById('post-body');
        if(bodyEl) bodyEl.innerHTML = post.content;

        // B. SEO METADATA MAPPING
        const seo = post.seo || {}; 

        // 1. Meta Title
        document.title = seo.metaTitle ? seo.metaTitle : `${post.title} | Chiari Voices`;

        // 2. Meta Description
        updateMetaTag('description', seo.description || post.content.replace(/<[^>]*>?/gm, '').substring(0, 150));

        // 3. Keywords
        const keywords = [seo.primaryKeyword, seo.secondaryKeywords].filter(k => k).join(', ');
        updateMetaTag('keywords', keywords);

        // 4. URL State Update (Visual Slug)
        if (seo.slug) {
            const newUrl = `${window.location.pathname}?id=${post.id}&slug=${seo.slug}`;
            window.history.replaceState({path: newUrl}, '', newUrl);
        }

    } else {
        if(contentContainer) {
            contentContainer.innerHTML = `
                <div class="text-center py-20">
                    <h2 class="text-3xl font-bold text-white mb-4">Post not found</h2>
                    <a href='index.html' class="text-[var(--color-primary)] hover:underline">Return to Blog Home</a>
                </div>
            `;
        }
    }
}

// Helper function to update or create <meta> tags
function updateMetaTag(name, content) {
    if (!content) return;
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
    }
    tag.content = content;
}

// Run Init
initStorage();
// renderSinglePost is usually called by the post.html file, 
// but we leave it exposed here for that file to call.