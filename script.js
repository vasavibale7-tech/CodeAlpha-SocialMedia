const API = "http://localhost:3000";

let currentUser = "";
let posts = [];

// LOGIN
async function login() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const message = document.getElementById("loginMessage");

    if (username === "" || password === "") {
        message.textContent = "Please enter username and password.";
        return;
    }

    try {
        const response = await fetch(`${API}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        currentUser = data.user.username;
        document.getElementById("profileName").textContent = currentUser;
        message.textContent = "Login successful! Welcome " + currentUser;

        loadPosts();

    } catch (error) {
        message.textContent = "Cannot connect to server.";
        console.error(error);
    }
}


// SIGN UP
async function signup() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const message = document.getElementById("loginMessage");

    if (username === "" || password === "") {
        message.textContent = "Please enter username and password.";
        return;
    }

    try {
        const response = await fetch(`${API}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            currentUser = username;
            document.getElementById("profileName").textContent = username;
        }

    } catch (error) {
        message.textContent = "Cannot connect to server.";
        console.error(error);
    }
}


// EDIT PROFILE
function editProfile() {
    const newName = prompt("Enter your new name:");

    if (newName) {
        document.getElementById("profileName").textContent = newName;
        currentUser = newName;
    }
}


// FOLLOW USER
async function followUser() {
    if (currentUser === "") {
        alert("Please login first.");
        return;
    }

    const followingUser = prompt("Enter username to follow:");

    if (!followingUser) {
        return;
    }

    try {
        const response = await fetch(`${API}/api/follow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                follower: currentUser,
                following: followingUser
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("You are now following " + followingUser);
        } else {
            alert(data.message);
        }

    } catch (error) {
        alert("Cannot connect to server.");
        console.error(error);
    }
}


// CREATE POST
async function createPost() {
    const postText = document.getElementById("postText").value.trim();

    if (currentUser === "") {
        alert("Please login first.");
        return;
    }

    if (postText === "") {
        alert("Please write something before posting.");
        return;
    }

    try {
        const response = await fetch(`${API}/api/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: currentUser,
                content: postText
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById("postText").value = "";
            loadPosts();
        } else {
            alert(data.message);
        }

    } catch (error) {
        alert("Cannot connect to server.");
        console.error(error);
    }
}


// LOAD POSTS
async function loadPosts() {
    try {
        const response = await fetch(`${API}/api/posts`);
        posts = await response.json();

        displayPosts();

    } catch (error) {
        console.error("Could not load posts:", error);
    }
}


// DISPLAY POSTS
function displayPosts() {
    const container = document.getElementById("postContainer");

    container.innerHTML = "";

    posts.forEach(function(post) {

        const postElement = document.createElement("div");

        postElement.className = "post";

        postElement.innerHTML = `
            <h3>${post.username}</h3>

            <p>${post.content}</p>

            <div class="post-actions">
                <button onclick="likePost(${post.id})">
                    ❤️ Like (${post.likes})
                </button>
            </div>

            <input
                class="comment-input"
                id="comment-${post.id}"
                placeholder="Write a comment..."
            >

            <button onclick="addComment(${post.id})">
                Comment
            </button>

            <div id="comments-${post.id}"></div>
        `;

        container.appendChild(postElement);

        loadComments(post.id);
    });
}


// LIKE POST
async function likePost(postId) {
    try {
        const response = await fetch(`${API}/api/posts/${postId}/like`, {
            method: "POST"
        });

        if (response.ok) {
            loadPosts();
        }

    } catch (error) {
        console.error(error);
    }
}


// ADD COMMENT
async function addComment(postId) {
    const input = document.getElementById("comment-" + postId);
    const commentText = input.value.trim();

    if (currentUser === "") {
        alert("Please login first.");
        return;
    }

    if (commentText === "") {
        alert("Please enter a comment.");
        return;
    }

    try {
        const response = await fetch(`${API}/api/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: currentUser,
                comment: commentText
            })
        });

        if (response.ok) {
            input.value = "";
            loadComments(postId);
        }

    } catch (error) {
        console.error(error);
    }
}


// LOAD COMMENTS
async function loadComments(postId) {
    try {
        const response = await fetch(
            `${API}/api/posts/${postId}/comments`
        );

        const comments = await response.json();

        const container =
            document.getElementById("comments-" + postId);

        if (!container) {
            return;
        }

        container.innerHTML = "";

        comments.forEach(function(comment) {

            const commentElement = document.createElement("div");

            commentElement.className = "comment";

            commentElement.textContent =
                comment.username + ": " + comment.comment;

            container.appendChild(commentElement);
        });

    } catch (error) {
        console.error(error);
    }
}
loadPosts();