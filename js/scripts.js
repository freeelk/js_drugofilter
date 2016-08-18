// Load friends from vk.com --------------------------------

let dragObject = null;

new Promise(function(resolve) {
    if (document.readyState === 'complete') {
        resolve();
    } else {
        window.onload = resolve;
    }
}).then(function() {
    return new Promise(function(resolve, reject) {
        VK.init({
            apiId: 5574381
        });
        VK.Auth.login(function(response) {
            if (response.session) {
                resolve(response);
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 6);
    });
}).then(function() {
    return new Promise(function(resolve, reject) {
        VK.api('friends.get', {'fields': 'photo_50'},
            function(response) {
                if (response.error) {
                    reject(new Error(response.error.error_msg));
                } else {
                    outData(response.response);
                    resolve();
                }
            });
    })
}).catch(function(e) {
    alert('Ошибка: ' + e.message);
});


// Events listeners--------------------------------------------------

document.querySelector("#left-panel").addEventListener('click', function (e) {
    if (hasClass(e.target, 'move-sign')) {
        moveElement(document.querySelector("#left-panel .friends-list"),
            document.querySelector("#right-panel .friends-list"),
            e.target.closest('li'));
    }
});

document.querySelector("#right-panel").addEventListener('click', function (e) {
    if (hasClass(e.target, 'move-sign')) {
        moveElement(document.querySelector("#right-panel .friends-list"),
            document.querySelector("#left-panel .friends-list"),
            e.target.closest('li'));
    }
});

document.getElementById('friend-common-input').addEventListener('input', function (e) {
    filter(document.querySelectorAll("#left-panel .friends-list li"), this.value);
});

document.getElementById('friend-selected-input').addEventListener('input', function (e) {
    filter(document.querySelectorAll("#right-panel .friends-list li"), this.value);
});

document.getElementById('save-button').addEventListener('click', function (e) {
    saveUids(document.querySelectorAll("#right-panel .friends-list li"));
});

document.querySelector("#left-panel .friends-list").addEventListener('dragstart', function (e) {
    dragObject = e.target;
    e.dataTransfer.setDragImage(getAvatarImage(), 5, 10);
});

document.querySelector("#right-panel .friends-list").addEventListener('dragover', function (e) {
    if (!document.querySelector("#right-panel .friends-list").contains(dragObject)) {
        e.dataTransfer.dropEffect = "copy";
    }
    e.preventDefault();
});

document.querySelector("#right-panel .friends-list").addEventListener('drop', function (e) {
        moveElement(document.querySelector("#left-panel .friends-list"),
         document.querySelector("#right-panel .friends-list"),
         dragObject);
    dragObject = null;
});

document.querySelector("#right-panel .friends-list").addEventListener('dragstart', function (e) {
    dragObject = e.target;
    e.dataTransfer.setDragImage(getAvatarImage(), 5, 10);
});

document.querySelector("#left-panel .friends-list").addEventListener('dragover', function (e) {
    if (!document.querySelector("#left-panel .friends-list").contains(dragObject)) {
        e.dataTransfer.dropEffect = "copy";
    }
    e.preventDefault();
});

document.querySelector("#left-panel .friends-list").addEventListener('drop', function (e) {
        moveElement(document.querySelector("#right-panel .friends-list"),
            document.querySelector("#left-panel .friends-list"),
            dragObject);
    dragObject = null;
});

// Functions --------------------------------------------------------

function outData(data) {
    let friendsUids = readUids();
    let commonFriends = [];
    let selectedFriends = [];

    for (let i=0;i<data.length;i++) {
        if (friendsUids.indexOf(data[i]['user_id'].toString()) > -1) {
            selectedFriends.push(data[i]);
        } else {
            commonFriends.push(data[i]);
        }
    }

    fillList(document.querySelector("#left-panel .friends-list"), commonFriends);
    fillList(document.querySelector("#right-panel .friends-list"), selectedFriends);
}

function fillList(list, data) {
    let source   = document.getElementById("friendslist-template").innerHTML;
    let template = Handlebars.compile(source);
    let html  = template(data);
    list.innerHTML = html;
}

function moveElement(from, to, element) {
    if (!to.contains(dragObject)) {
        from.removeChild(element);
        to.appendChild(element);
    }
}

function filter(listElements, filterStr) {

    for (let i=0;i<listElements.length;i++) {
        if (filter === '' || listElements[i].children[1].innerHTML.indexOf(filterStr) > -1) {
            listElements[i].style.display = '';
        } else {
            listElements[i].style.display = 'none';
        }
    }
}

function saveUids(listElements) {
    let uids = '';
    for (let i=0;i<listElements.length;i++) {
        uids += listElements[i].getAttribute('data-uid') + ' ';
    }

    document.cookie = 'uids' + '=' + uids.trim();
}


function readUids() {
    let cookie = [];
    let result = document.cookie.match(new RegExp('uids=([^;]+)'));
    result && (cookie = result[1].split(' '));
    return cookie;
}

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function getAvatarImage() {
    let image = document.createElement('img');
    image.setAttribute('src', 'images/drag-avatar.png');
    return image;
}