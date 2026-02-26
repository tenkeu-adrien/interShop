const postsContainer = document.getElementById("posts");
const darkToggle = document.getElementById("darkToggle");

let loading = false;

darkToggle.addEventListener("click",()=>{
  document.body.classList.toggle("dark");
});

function createPost(){
  const post = document.createElement("div");
  post.className="post";
  post.innerHTML=`
    <div class="post-img"></div>
    <div class="post-content">
      <h3>Villa Moderne – Cocody</h3>
      <p>4 chambres • Piscine • Quartier sécurisé</p>
      <div class="price">120 000 000 FCFA</div>
    </div>
    <div class="actions">
      <button>❤️ J’aime</button>
      <button>💬 Commenter</button>
      <button>🔗 Partager</button>
    </div>
  `;
  return post;
}

function loadPosts(){
  if(loading) return;
  loading=true;

  const skeleton=document.createElement("div");
  skeleton.className="skeleton";
  postsContainer.appendChild(skeleton);

  setTimeout(()=>{
    skeleton.remove();
    for(let i=0;i<3;i++){
      postsContainer.appendChild(createPost());
    }
    loading=false;
  },1200);
}

window.addEventListener("scroll",()=>{
  if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 150){
    loadPosts();
  }
});

loadPosts();
