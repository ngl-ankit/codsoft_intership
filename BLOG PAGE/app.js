// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDH3Iu_c2_3DhMR5zoj-rqR_61fSR75E7U",
  authDomain: "internship-dee45.firebaseapp.com",
  projectId: "internship-dee45",
  storageBucket: "internship-dee45.appspot.com",
  messagingSenderId: "27151487254",
  appId: "1:27151487254:web:d5cb6f3f14ee918f84c037",
  measurementId: "G-JGTG6CW99Y"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized (Production Mode)");
}

// ✅ Function to save post to Firestore



// ✅ Global Application State
const app = {
  currentUser: null,
  currentPage: 'home',
  posts: [],
  comments: {},
  isFirebaseConnected: false,
  editingPostId: null,
  currentPostId: null,
  isDarkMode: false,
  searchQuery: '',
  currentFilter: 'all'
};

// ✅ Initialize Firebase
const initFirebase = () => {
  try {
    const firebaseApp = firebase.initializeApp(firebaseConfig);
    app.auth = firebaseApp.auth();
    app.db = firebaseApp.firestore();
    app.isFirebaseConnected = true;

    console.log('%cFirebase initialized (Production Mode)', 'color: green;');

    app.auth.onAuthStateChanged(user => {
      if (user) {
        app.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
        updateAuthState();
      } else {
        app.currentUser = null;
        updateAuthState();
      }
    });

  
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    showToast('Firebase connection failed. Running in demo mode.', 'warning');
    app.isFirebaseConnected = false;
    loadSampleData();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  initFirebase();
});



// ✅ Dummy Sample Data Loader
async function loadSampleData() {
  try {
    const res = await fetch('https://dummyjson.com/posts?limit=50');
    const data = await res.json();

    app.posts = data.posts.map(post => ({
      id: String(post.id),
      title: post.title,
      content: post.body,
      author: `User${post.userId}`,
      authorId: `user${post.userId}`,
      category: post.tags[0] || 'general',
      image: `https://picsum.photos/seed/${post.id}/800/400`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 50 * 86400000)),
      views: Math.floor(Math.random() * 500) + 100,
      likes: Math.floor(Math.random() * 100) + 10,
      likedBy: []
    }));

    await loadComments();
    updatePostUI();
    console.log("✅ Loaded posts and comments successfully (Demo Mode).", app.posts);
  } catch (err) {
    console.error('❌ Failed to load sample data:', err);
    app.posts = [];
    app.comments = {};
  }
}

async function loadComments() {
  app.comments = {};

  for (let post of app.posts) {
    try {
      const res = await fetch(`https://dummyjson.com/posts/${post.id}/comments`);
      const { comments } = await res.json();
      app.comments[post.id] = comments.map(comment => ({
        id: String(comment.id),
        content: comment.body,
        author: `User${comment.user.id}`,
        authorId: `user${comment.user.id}`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 86400000))
      }));
    } catch (error) {
      console.warn(`⚠️ Failed to fetch comments for post ${post.id}`);
      app.comments[post.id] = [];
    }
  }
}

// ✅ Auth Functions
app.login = async function(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  showLoading('login');

  try {
    const userCredential = await app.auth.signInWithEmailAndPassword(email, password);
    app.currentUser = userCredential.user;
    showToast('Login successful!', 'success');
    updateAuthState();
    app.navigate('dashboard');
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login failed. Please try again.', 'error');
  } finally {
    hideLoading('login');
  }
};

app.register = async function(event) {
  event.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  showLoading('register');

  try {
    const userCredential = await app.auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({ displayName: name });
    app.currentUser = userCredential.user;
    showToast('Account created successfully!', 'success');
    updateAuthState();
    app.navigate('dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Registration failed. Please try again.', 'error');
  } finally {
    hideLoading('register');
  }
};

app.logout = function() {
  if (app.isFirebaseConnected && app.auth) {
    app.auth.signOut();
  }
  app.currentUser = null;
  updateAuthState();
  app.navigate('home');
  showToast('Logged out successfully', 'success');
};

function updatePostUI() {
  const container = document.getElementById('post-list');
  if (!container) return;
  container.innerHTML = '';

  if (app.posts.length === 0) {
    container.innerHTML = '<p>No posts found.</p>';
    return;
  }

  app.posts.forEach(post => {
    const postEl = document.createElement('div');
    postEl.className = 'post-card';
    postEl.innerHTML = `
      <img src="${post.image}" alt="Post Image" />
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <p><strong>Author:</strong> ${post.author}</p>
      <p><strong>Category:</strong> ${post.category}</p>
    `;
    container.appendChild(postEl);
  });
}
app.saveData = function () {
    localStorage.setItem('posts', JSON.stringify(app.posts));
    localStorage.setItem('comments', JSON.stringify(app.comments));
};

app.loadData = function () {
    const savedPosts = localStorage.getItem('posts');
    const savedComments = localStorage.getItem('comments');
    
    app.posts = savedPosts ? JSON.parse(savedPosts) : [];
    app.comments = savedComments ? JSON.parse(savedComments) : {};
};


function updateAuthState() {
  // Reflect UI changes based on login state
}

function showLoading(id) {
  // Show loading animation or disable buttons
}

function hideLoading(id) {
  // Hide loading indicator
}

function showToast(message, type) {
  // Display toast messages
}

app.navigate = function(page, postId = null) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  app.currentPage = page;
  const targetPage = document.getElementById(`${page}-page`);
  if (targetPage) targetPage.classList.remove('hidden');

  switch(page) {
    case 'home':
      if (app.isFirebaseConnected)  loadSampleData();
      break;
    case 'dashboard':
    case 'create':
    case 'profile':
      if (!app.currentUser) {
        app.navigate('login');
        showToast('Please log in to continue.', 'warning');
        return;
      }
      break;
    case 'post':
      if (postId) {
        app.currentPostId = postId;
        loadPost(postId);
      }
      break;
    case 'login':
    case 'register':
      if (app.currentUser) {
        app.navigate('dashboard');
        return;
      }
      break;
  }
  updateNavigation();
  window.scrollTo(0, 0);
};

function updateNavigation() {
  // Update active nav button based on app.currentPage
}

function loadDashboard() {
  // Load user posts or dashboard UI
}

function resetCreateForm() {
  // Clear post form fields for creating post
}

function loadProfile() {
  // Load current user's profile info
}

function loadPost(postId) {
  // Load a single post and comments
}

// Load posts and comments from localStorage
// Load posts and comments from localStorage
app.posts = JSON.parse(localStorage.getItem('posts')) || [];
app.comments = JSON.parse(localStorage.getItem('comments')) || {};

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // ✅ User is logged in
    console.log("Logged in as:", user.email);

    // Now you can safely access user.email or user.uid
    const post = {
      title: "My Blog",
      content: "Blog content here...",
      author: user.email,
      authorId: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      likes: 0,
      likedBy: [],
      category: "General"
    };

    savePostToFirestore(post);

  } else {
    // ❌ No user is logged in
    console.log("User not logged in.");
    alert("Please log in to post.");
  }
});



// Create Post
app.createPost = async function (event) {
    event.preventDefault();

    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const image = document.getElementById('post-image').value;
    const category = document.getElementById('post-category').value;

    if (!app.currentUser) {
        showToast('Please log in to create posts', 'warning');
        return;
    }

    try {
        const post = {
            id: app.editingPostId || 'post-' + Date.now(),
            title,
            content,
            image: image || null,
            category,
            author: app.currentUser.displayName,
            authorId: app.currentUser.uid,
            createdAt: app.editingPostId
                ? app.posts.find(p => p.id === app.editingPostId)?.createdAt || new Date()
                : new Date(),
            updatedAt: new Date(),
            views: app.editingPostId
                ? app.posts.find(p => p.id === app.editingPostId)?.views || 0
                : 0,
            likes: app.editingPostId
                ? app.posts.find(p => p.id === app.editingPostId)?.likes || 0
                : 0,
            likedBy: app.editingPostId
                ? app.posts.find(p => p.id === app.editingPostId)?.likedBy || []
                : []
        };

        if (app.editingPostId) {
            const index = app.posts.findIndex(p => p.id === app.editingPostId);
            if (index !== -1) {
                app.posts[index] = post;
            }
        } else {
            app.posts.unshift(post);
        }

        app.saveData();

        showToast(`Post ${app.editingPostId ? 'updated' : 'created'} successfully!`, 'success');

        app.editingPostId = null;
        app.navigate('dashboard');
        loadDashboard(); // 🟢 Refresh posts

    } catch (error) {
        console.error('Post creation error:', error);
        showToast('Failed to save post. Please try again.', 'error');
    }
};

// Edit Post
app.editPost = function (postId) {
    const post = app.posts.find(p => p.id === postId);
    if (!post) return;

    if (post.authorId !== app.currentUser?.uid) {
        showToast('You can only edit your own posts', 'warning');
        return;
    }

    app.editingPostId = postId;

    document.getElementById('post-title').value = post.title;
    document.getElementById('post-content').value = post.content;
    document.getElementById('post-image').value = post.image || '';
    document.getElementById('post-category').value = post.category;

    document.getElementById('create-title').textContent = 'Edit Post';
    document.getElementById('post-btn-text').textContent = 'Update Post';

    app.navigate('create');
};

// Delete Post
app.deletePost = function (postId) {
    const post = app.posts.find(p => p.id === postId);
    if (!post) return;

    const currentUserId = app.currentUser?.uid;

    if (!currentUserId) {
        showToast('You must be logged in to delete posts', 'warning');
        return;
    }

    if (post.authorId !== currentUserId) {
        showToast('You can only delete your own posts', 'warning');
        return;
    }

    if (!confirm('Are you sure you want to delete this post?')) return;

    app.posts = app.posts.filter(p => p.id !== postId);
    delete app.comments[postId];
    app.saveData();

    showToast('Post deleted successfully', 'success');

    if (app.currentPage === 'dashboard') loadDashboard();
    else if (app.currentPage === 'profile') loadProfile();
    else loadPosts();
};


// Like Post
app.likePost = function (postId) {
    if (!app.currentUser) {
        showToast('Please log in to like posts', 'warning');
        return;
    }

    const post = app.posts.find(p => p.id === postId);
    if (!post) return;

    const userId = app.currentUser.uid;
    const isLiked = post.likedBy.includes(userId);

    if (isLiked) {
        post.likedBy = post.likedBy.filter(id => id !== userId);
        post.likes = Math.max(0, post.likes - 1);
    } else {
        post.likedBy.push(userId);
        post.likes += 1;
    }

    app.saveData();
    updatePostLikeButton(postId, !isLiked);
};

// Comment
app.addComment = function (event) {
    event.preventDefault();

    const content = document.getElementById('comment-content').value.trim();
    if (!content) return;

    if (!app.currentUser) {
        showToast('Please log in to comment', 'warning');
        return;
    }

    const comment = {
        id: 'comment-' + Date.now(),
        content,
        author: app.currentUser.displayName,
        authorId: app.currentUser.uid,
        postId: app.currentPostId,
        createdAt: new Date()
    };

    if (!app.comments[app.currentPostId]) {
        app.comments[app.currentPostId] = [];
    }

    app.comments[app.currentPostId].push(comment);
    app.saveData();

    document.getElementById('comment-content').value = '';
    loadComments(app.currentPostId);

    showToast('Comment added successfully!', 'success');
};

// Search & Filter
app.searchPosts = function () {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    app.searchQuery = query;
    filterAndDisplayPosts();
};

app.filterPosts = function (filter) {
    app.currentFilter = filter;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-gradient-to-r', 'from-blue-500', 'to-purple-600');
        btn.classList.add('glass');
    });

    event.target.classList.remove('glass');
    event.target.classList.add('active', 'bg-gradient-to-r', 'from-blue-500', 'to-purple-600');

    filterAndDisplayPosts();
};

function filterAndDisplayPosts() {
    let filteredPosts = [...app.posts];

    if (app.searchQuery) {
        filteredPosts = filteredPosts.filter(post =>
            post.title.toLowerCase().includes(app.searchQuery) ||
            post.content.toLowerCase().includes(app.searchQuery) ||
            post.author.toLowerCase().includes(app.searchQuery)
        );
    }

    switch (app.currentFilter) {
        case 'recent':
            filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'popular':
            filteredPosts.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
            break;
    }

    displayPosts(filteredPosts);
}

function loadPosts() {
    showElement('loading-posts');
    hideElement('no-posts');

    setTimeout(() => {
        hideElement('loading-posts');
        filterAndDisplayPosts();
    }, 300);
}

function loadDashboard() {
    app.currentPage = 'dashboard';
    document.getElementById('dashboard-title').textContent = `Welcome, ${app.currentUser?.displayName || 'Guest'}`;
    loadPosts();
}

function loadProfile() {
    app.currentPage = 'profile';
    const myPosts = app.posts.filter(post => post.authorId === app.currentUser?.uid);
    displayPosts(myPosts);
}

function displayPosts(posts) {
    const container = document.getElementById('posts-grid');
    container.innerHTML = '';

    if (posts.length === 0) {
        showElement('no-posts');
        return;
    }

    hideElement('no-posts');

    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post-card';
        div.innerHTML = `
            <div class="p-4 bg-white/5 rounded-xl shadow-lg border border-white/10">
                <h2 class="text-xl font-bold">${post.title}</h2>
                <p class="text-sm text-gray-300">${post.content.slice(0, 100)}...</p>
                <p class="text-xs mt-2 text-gray-500">By ${post.author}</p>
                <button onclick="app.editPost('${post.id}')">Edit</button>
                <button onclick="app.deletePost('${post.id}')">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });


                                                                                                                                                                              
                                                                                                                                                                            
 container.innerHTML = posts.map(post => `
        <article class="glass rounded-xl overflow-hidden hover-lift cursor-pointer transition-all duration-300" onclick="app.navigate('post', '${post.id}')">
            ${post.image ? `
                <div class="h-48 bg-cover bg-center" style="background-image: url('${post.image}')"></div>
            ` : `
                <div class="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg class="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
                    </svg>
                </div>
            `}
            <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                    <span class="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full font-medium">
                        ${post.category}
                    </span>
                    <span class="text-white text-opacity-60 text-sm">
                        ${formatDate(post.createdAt)}
                    </span>
                </div>
                <h3 class="text-xl font-bold text-white mb-3 line-clamp-2">${post.title}</h3>
                <p class="text-white text-opacity-70 mb-4 line-clamp-3">${post.content.substring(0, 150)}...</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-bold">${post.author.charAt(0).toUpperCase()}</span>
                        </div>
                        <span class="text-white text-opacity-80 text-sm">${post.author}</span>
                    </div>
                    <div class="flex items-center space-x-4 text-white text-opacity-60 text-sm">
                        <span class="flex items-center space-x-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                            </svg>
                            <span>${post.views}</span>
                        </span>
                        <span class="flex items-center space-x-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                            </svg>
                            <span>${post.likes}</span>
                        </span>
                    </div>
                </div>
            </div>
        </article>
    `).join('');
}

function loadPost(postId) {
    const post = app.posts.find(p => p.id === postId);
    if (!post) {
        showToast('Post not found', 'error');
        app.navigate('home');
        return;
    }
    
    // Increment view count
    post.views += 1;
    
    const container = document.getElementById('post-content-container');
    const isLiked = app.currentUser && post.likedBy.includes(app.currentUser.uid);
    
    container.innerHTML = `
        ${post.image ? `
            <div class="h-64 md:h-96 bg-cover bg-center rounded-lg mb-8" style="background-image: url('${post.image}')"></div>
        ` : ''}
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold">${post.author.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                    <h3 class="text-white font-semibold">${post.author}</h3>
                    <p class="text-white text-opacity-60 text-sm">${formatDate(post.createdAt)}</p>
                </div>
            </div>
            <span class="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-full font-medium">
                ${post.category}
            </span>
        </div>
        
        <h1 class="text-4xl font-bold text-white mb-6">${post.title}</h1>
        
        <div class="prose prose-invert max-w-none mb-8">
            <div class="text-white text-opacity-90 leading-relaxed whitespace-pre-line">${post.content}</div>
        </div>
        
        <div class="flex items-center justify-between pt-6 border-t border-white border-opacity-20">
            <div class="flex items-center space-x-6 text-white text-opacity-60">
                <span class="flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>${post.views} views</span>
                </span>
                <span class="flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clip-rule="evenodd"></path>
                    </svg>
                    <span>${(app.comments[postId] || []).length} comments</span>
                </span>
            </div>
            <button onclick="app.likePost('${postId}')" id="like-btn-${postId}" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${isLiked ? 'bg-gradient-to-r from-pink-500 to-red-600 text-white' : 'glass text-white hover:bg-white hover:bg-opacity-20'}">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
                <span>${post.likes}</span>
            </button>
        </div>
        
        ${app.currentUser && post.authorId === app.currentUser.uid ? `
            <div class="flex space-x-4 mt-6 pt-6 border-t border-white border-opacity-20">
                <button onclick="app.editPost('${postId}')" class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium">
                    Edit Post
                </button>
                <button onclick="app.deletePost('${postId}')" class="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium">
                    Delete Post
                </button>
            </div>
        ` : ''}
    `;
    
    // Load comments
    loadComments(postId);
    
    // Update comment form visibility
    if (app.currentUser) {
        showElement('comment-form-container');
        hideElement('login-to-comment');
    } else {
        hideElement('comment-form-container');
        showElement('login-to-comment');
    }
}

function loadComments(postId) {
    const comments = app.comments[postId] || [];
    const container = document.getElementById('comments-list');
    
    showElement('loading-comments');
    hideElement('no-comments');
    
    setTimeout(() => {
        hideElement('loading-comments');
        
        if (comments.length === 0) {
            showElement('no-comments');
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = comments.map(comment => `
            <div class="glass rounded-lg p-4 mb-4">
                <div class="flex items-start space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="text-white font-bold text-sm">${comment.author.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <h4 class="text-white font-semibold">${comment.author}</h4>
                            <span class="text-white text-opacity-60 text-sm">${formatDate(comment.createdAt)}</span>
                        </div>
                        <p class="text-white text-opacity-90">${comment.content}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }, 300);
}

function loadDashboard() {
    if (!app.currentUser) return;
    
    const userPosts = app.posts.filter(p => p.authorId === app.currentUser.uid);
    const totalViews = userPosts.reduce((sum, post) => sum + post.views, 0);
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = userPosts.reduce((sum, post) => sum + (app.comments[post.id] || []).length, 0);
    
    // Update stats
    document.getElementById('total-posts').textContent = userPosts.length;
    document.getElementById('total-views').textContent = totalViews;
    document.getElementById('total-likes').textContent = totalLikes;
    document.getElementById('total-comments').textContent = totalComments;
    
    // Load user posts
    showElement('loading-my-posts');
    hideElement('no-my-posts');
    
    setTimeout(() => {
        hideElement('loading-my-posts');
        
        if (userPosts.length === 0) {
            showElement('no-my-posts');
            document.getElementById('my-posts-grid').innerHTML = '';
            return;
        }
        
        document.getElementById('my-posts-grid').innerHTML = userPosts.map(post => `
            <div class="glass rounded-lg p-6 hover-lift">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-white">${post.title}</h3>
                    <div class="flex space-x-2">
                        <button onclick="app.editPost('${post.id}')" class="text-blue-300 hover:text-blue-200 transition-colors duration-200">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                                <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                        <button onclick="app.deletePost('${post.id}')" class="text-red-300 hover:text-red-200 transition-colors duration-200">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v4a1 1 0 11-2 0V7z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <p class="text-white text-opacity-70 mb-4">${post.content.substring(0, 100)}...</p>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-white text-opacity-60">${formatDate(post.createdAt)}</span>
                    <div class="flex items-center space-x-4 text-white text-opacity-60">
                        <span>${post.views} views</span>
                        <span>${post.likes} likes</span>
                        <span>${(app.comments[post.id] || []).length} comments</span>
                    </div>
                </div>
            </div>
        `).join('');
    }, 500);
}

function loadProfile() {
    if (!app.currentUser) return;
    
    const userPosts = app.posts.filter(p => p.authorId === app.currentUser.uid);
    const totalViews = userPosts.reduce((sum, post) => sum + post.views, 0);
    const totalComments = userPosts.reduce((sum, post) => sum + (app.comments[post.id] || []).length, 0);
    
    // Update profile info
    document.getElementById('profile-name').textContent = app.currentUser.displayName;
    document.getElementById('profile-email').textContent = app.currentUser.email;
    document.getElementById('profile-avatar').textContent = app.currentUser.displayName.charAt(0).toUpperCase();
    
    // Update stats
    document.getElementById('profile-posts-count').textContent = userPosts.length;
    document.getElementById('profile-views-count').textContent = totalViews;
    document.getElementById('profile-comments-count').textContent = totalComments;
    
    // Load user posts
    showElement('loading-profile-posts');
    hideElement('no-profile-posts');
    
    setTimeout(() => {
        hideElement('loading-profile-posts');
        
        if (userPosts.length === 0) {
            showElement('no-profile-posts');
            document.getElementById('profile-posts-grid').innerHTML = '';
            return;
        }
        
        document.getElementById('profile-posts-grid').innerHTML = userPosts.map(post => `
            <div class="glass rounded-lg overflow-hidden hover-lift cursor-pointer" onclick="app.navigate('post', '${post.id}')">
                ${post.image ? `
                    <div class="h-32 bg-cover bg-center" style="background-image: url('${post.image}')"></div>
                ` : `
                    <div class="h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <svg class="w-8 h-8 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                `}
                <div class="p-4">
                    <h3 class="text-lg font-bold text-white mb-2">${post.title}</h3>
                    <p class="text-white text-opacity-70 text-sm mb-3">${post.content.substring(0, 80)}...</p>
                    <div class="flex items-center justify-between text-xs text-white text-opacity-60">
                        <span>${formatDate(post.createdAt)}</span>
                        <div class="flex space-x-3">
                            <span>${post.views} views</span>
                            <span>${post.likes} likes</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }, 500);
}

// Theme Functions
app.toggleTheme = function() {
    app.isDarkMode = !app.isDarkMode;
    const body = document.body; // simpler and more reliable
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    
    if (app.isDarkMode) {
        body.classList.add('dark');  // Add dark mode class
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        body.classList.remove('dark');  // Remove dark mode class
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
    
    localStorage.setItem('darkMode', app.isDarkMode.toString());
};


// User Menu Functions
app.toggleUserMenu = function() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('hidden');
};

// Utility Functions
app.scrollToPosts = function() {
    document.getElementById('posts-container').scrollIntoView({ 
        behavior: 'smooth' 
    });
};

function resetCreateForm() {
    document.getElementById('post-form').reset();
    document.getElementById('create-title').textContent = 'Create New Post';
    document.getElementById('post-btn-text').textContent = 'Publish Post';
    app.editingPostId = null;
}

function updateAuthState() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const dashboardLink = document.getElementById('dashboard-link');
    const createLink = document.getElementById('create-link');
    const profileLink = document.getElementById('profile-link');
    
    if (app.currentUser) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        dashboardLink.classList.remove('hidden');
        createLink.classList.remove('hidden');
        profileLink.classList.remove('hidden');
        
        // Update user info
        document.getElementById('user-name').textContent = app.currentUser.displayName;
        document.getElementById('user-avatar').textContent = app.currentUser.displayName.charAt(0).toUpperCase();
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
        dashboardLink.classList.add('hidden');
        createLink.classList.add('hidden');
        profileLink.classList.add('hidden');
    }
}

function updateNavigation() {
    // Close user dropdown when navigating
    document.getElementById('user-dropdown').classList.add('hidden');
}

function updatePostLikeButton(postId, isLiked) {
    const button = document.getElementById(`like-btn-${postId}`);
    if (!button) return;
    
    const post = app.posts.find(p => p.id === postId);
    if (!post) return;
    
    if (isLiked) {
        button.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 bg-gradient-to-r from-pink-500 to-red-600 text-white';
    } else {
        button.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 glass text-white hover:bg-white hover:bg-opacity-20';
    }
    
    button.querySelector('span').textContent = post.likes;
}

function showLoading(type) {
    const loadingElement = document.getElementById(`${type}-loading`);
    const textElement = document.getElementById(`${type}-btn-text`);
    
    if (loadingElement && textElement) {
        loadingElement.classList.remove('hidden');
        textElement.classList.add('hidden');
    }
}

function hideLoading(type) {
    const loadingElement = document.getElementById(`${type}-loading`);
    const textElement = document.getElementById(`${type}-btn-text`);
    
    if (loadingElement && textElement) {
        loadingElement.classList.add('hidden');
        textElement.classList.remove('hidden');
    }
}

function showElement(id) {
    const element = document.getElementById(id);
    if (element) element.classList.remove('hidden');
}

function hideElement(id) {
    const element = document.getElementById(id);
    if (element) element.classList.add('hidden');
}

function formatDate(date) {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    
    return postDate.toLocaleDateString();
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }[type] || 'bg-blue-500';
    
    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    initFirebase();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        app.toggleTheme();
    }
    
    // Initialize navigation
    updateAuthState();
    app.navigate('home');
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const userMenu = document.getElementById('user-menu');
        const dropdown = document.getElementById('user-dropdown');
        
        if (!userMenu.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Search on Enter key
    document.getElementById('search-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            app.searchPosts();
        }
    });
    
    console.log('BlogSpace initialized successfully!');
});



// Export app for global access
window.app = app;
