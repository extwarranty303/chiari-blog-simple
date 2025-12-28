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
            image: "https://via.placeholder.com/1200x600?text=Welcome",
            content: "<p>Welcome to our new foundation blog.</p>",
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

// 3. RENDER FEED (index.html)
function renderFeed() {
    const feedContainer = document.getElementById('blog-feed');
    if (!feedContainer) return;

    const posts = getPosts();
    posts.sort((a, b) => b.id - a.id); 

    if (posts.length === 0) {
        feedContainer.innerHTML = "<p>No posts published yet.</p>";
        return;
    }

    feedContainer.innerHTML = posts.map(post => {
        const imgUrl = post.image || 'https://via.placeholder.com/800x400?text=Chiari+Voices';
        return `
        <article class="blog-card" style="padding:0; overflow:hidden;">
            <img src="${imgUrl}" class="card-thumbnail" alt="${post.title}">
            <div style="padding: 1.5rem;">
                <div class="blog-meta">${post.date} | By ${post.author}</div>
                <h2>${post.title}</h2>
                <p>${post.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
                <a href="post.html?id=${post.id}" class="read-more">Read Full Article →</a>
            </div>
        </article>
        `;
    }).join('');
}

// 4. RENDER SINGLE POST (post.html) - UPDATED WITH SEO MAPPER
function renderSinglePost() {
    const contentContainer = document.getElementById('post-content');
    if (!contentContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const post = getPosts().find(p => p.id == postId);

    if (post) {
        // A. Visual Content
        const bannerEl = document.getElementById('post-banner');
        if (bannerEl) bannerEl.src = post.image || 'https://via.placeholder.com/1200x600';
        
        document.getElementById('post-title').innerText = post.title;
        document.getElementById('post-meta').innerText = `Published on ${post.date} by ${post.author}`;
        document.getElementById('post-body').innerHTML = post.content;

        // B. SEO METADATA MAPPING
        const seo = post.seo || {}; // Handle old posts that might not have SEO data

        // 1. Meta Title (Browser Tab)
        // Use custom Meta Title if it exists, otherwise use Post Title
        document.title = seo.metaTitle ? seo.metaTitle : `${post.title} | Chiari Voices`;

        // 2. Meta Description
        updateMetaTag('description', seo.description || post.content.replace(/<[^>]*>?/gm, '').substring(0, 150));

        // 3. Keywords (Primary + Secondary)
        const keywords = [seo.primaryKeyword, seo.secondaryKeywords].filter(k => k).join(', ');
        updateMetaTag('keywords', keywords);

        // 4. Canonical / Slug (Visual URL Update)
        // Since we can't change the actual file path, we update the browser URL visually
        // to look like: /post.html?id=123&slug=my-custom-slug
        if (seo.slug) {
            const newUrl = `${window.location.pathname}?id=${post.id}&slug=${seo.slug}`;
            window.history.replaceState({path: newUrl}, '', newUrl);
        }

    } else {
        contentContainer.innerHTML = "<h2>Post not found</h2><a href='index.html'>Go Home</a>";
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