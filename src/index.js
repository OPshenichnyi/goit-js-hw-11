import axios from 'axios';
import throttle from '/node_modules/lodash/throttle'; 
import Notiflix from 'notiflix';



//* Обєкт для збереження пошукових даних 
let user = {};
let page = 1;
let countPage = 0;
//* Отримуємо доступ до елементів 
const elements = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    load: document.querySelector('.load-more')
};

elements.form.elements[1].style.visibility = 'hidden';


//* Встановлюємо прослуховувачи подій 
elements.form.addEventListener('input', throttle(handlerInput, 500));
elements.form.addEventListener('submit', (e) => { e.preventDefault(findImage(), cleanGallery())});
elements.load.addEventListener('click', cauntPage);


//* Функція записує в обєкт пошукові данні юзера 
function handlerInput(evt) { 
    user[evt.target.name] = `${evt.target.value}`;
    if (user) {
        elements.form.elements[1].style.visibility = 'visible';  
    }
    page = 1;
    countPage = 0;
}

//*Функція яка очищає галерею 
async function cleanGallery() {
    elements.gallery.innerHTML = ''; 
}

//*Лічильник сторінок
function cauntPage() {
    page +=1;
    findImage();
}

//* Функція виконує запит на бекенд 
async function findImage(evt) {
    const {searchQuery} = user; 

    const options = {
        params: {
            key: '38368934-291effe9d25e1bec757593010',
            q: searchQuery,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: "true",
            page: page,
            per_page: 40,
        }
    };
    elements.load.style.visibility = 'hidden';


    await axios.get('https://pixabay.com/api/', options)
        .then((res) => {          
            
            if (res.data.total === 0) {
                Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
            } else {
                elements.gallery.insertAdjacentHTML('beforeend', murkupSelect(res.data.hits));
                elements.load.style.visibility = 'visible';
                if (countPage < options.params.per_page) {
                    Notiflix.Notify.success(`Hooray! We found ${res.data.totalHits} images`);
                };
                countPage += options.params.per_page;
                if(countPage >= res.data.totalHits) {
                    Notiflix.Notify.failure(`"We're sorry, but you've reached the end of search results."`); 
                    elements.load.style.visibility = 'hidden';
                };
            };
        })
        .catch((res) => { Notiflix.Notify.failure(`Sorry ${res.statusText}. Please try again.`) });
};

//* Функція здійснює HTML розмітку 
function murkupSelect(arr) {
  return arr.map(item =>
`<div class="photo-card">

    <img src="${item.webformatURL}" alt="item.tags" loading="lazy"/>
    
    <div class="info">
        <p class="info-item">
            <b>Likes:${item.likes}</b>
        </p>
        <p class="info-item">
            <b>Views:${item.views}</b>
        </p>
        <p class="info-item">
            <b>Comments:${item.comments}</b>
        </p>
        <p class="info-item">
            <b>Downloads:${item.downloads}</b>
        </p>
    </div>

</div>`).join(''); 
};

