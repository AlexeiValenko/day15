'use strict'


var fsStorage = [{
    id: 0,
    name: 'root',
    type: 'directory',
    children: [{
        id: 1,
        name: 'file1.txt',
        type: 'file',
        content: '1111111'
    },

        {
            id: 2,
            name: 'sub1',
            type: 'directory',
            children: [

                {
                    id: 3,
                    name: 'file3.txt',
                    type: 'file',
                    content: 'nnnnnnnn'

                },
                {
                    id: 4,
                    name: 'file4.txt',
                    type: 'file',
                    content: 'hhhhhhh'

                }
            ]

        },


        {
            id: 5,
            name: 'file.txt',
            type: 'file',
            content: 'ffff'

        }
    ]}
];


/*
Add history handling
 */

//var fsStorage = [];
var flatSystem = [];
var root = {id      : 0,
    name    : 'root',
    type    : 'directory',
    children : []
};

//fsStorage.push(root);
var lastId = 0;

var tmpLastId = 0;
var tmpFsStorage = [];
var treatedNodes = 0;

var history = []; // list od strings
var currentHistoryPosition = -1;

function childId(folder,index) {
    return folder.children[index].id;
}

function childName(folder,index) {
    return folder.children[index].name;
}

function childType(folder,index) {
    return folder.children[index].type;
}

function childContent(folder,index) {
    return folder.children[index].content;
}

function addChild(folder,content) {

    folder.children.push(content);
}

function deleteChild(folder,index){
    folder.children.splice(index,1);
}

function findFolderInArray(array,currentFolderId) {
    for(var i in array) {
        if(array[i].id == currentFolderId) {
            return array[i];
        } else {
            var resultFromChild = findFolderInArray(array[i].children,currentFolderId);
            if(resultFromChild ) return resultFromChild;
        }
    }
}

function haveChildWithId(array, id) {
    for(var i in array) {
        if (array[i].id == id) return true;
    }
    return false;
}

function findChildren(array,id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id == id) {
            if(array[i].children) return array[i].children;
            else return;
        } else {
            if(array[i].children) {
                return findChildren(array[i].children,id);
            }
        }
    }
}

function findFile(array,id) {
    var file ;
    for(var i = 0; i < array.length; i++) {
        if(array[i].children)
        {
            file = findFile(array[i].children,id);
            if(file ) return file;
        }
        if(array[i].id == id) return array[i];
    }
}

function findFatherRecursevly(array, id) {
    for(var i in array) {
        if(haveChildWithId(array[i].children, id)) {
            return array[i];
        } else {
            var resultFromChild = findFatherRecursevly(array[i].children, id);
            if(resultFromChild != 0) return resultFromChild;
        }
    }
    return 0;
}

function findFather(id) {
    return findFatherRecursevly(fsStorage, id);

}


function findFullPassRecursevly(array, id) {
    for(var i in array) {
        if(array[i].id == id) {
            return array[i].name;
        } else {
            var resultFromChild = findFullPassRecursevly(array[i].children, id);
            if(resultFromChild != '') return array[i].name + '/' + resultFromChild;
        }
    }
    return '';
}

function findFullPass(id) {
    return findFullPassRecursevly(fsStorage, id);

}

function deleteFileOrFolder(id) {
    var father = findFather(id);
    for(var i in father.children) {
        if(childName(father,i) == id) {
            deleteChild(father,i);
            return;
        }
    }
    saveSystemToFile();
}

function usedName(father, name) {
    for(var i in father.children) {
        if(childName(father,i) == name) {
            return true;
        }
    }
    return false;
}

function uniqueName(father, name) {
    var suffix = '';
    if(usedName(father,name)) {
        suffix = 1;
        while(usedName(father,name + suffix)) {
            suffix++;
        }
    };
    return name + suffix;
}

function createFile(father,content) {
    var name = uniqueName(father,'New File');
    var newFile = { id: ++lastId, name: name, content: content, type: 'file' };
    addChild(father,newFile);
    saveSystemToFile();
    return newFile;
}

function createFolder(father) {
    var name = uniqueName(father,'New Folder');
    var newFolder = { id: ++lastId, name: name, children: [], type: 'directory'}
    addChild(father,newFolder);
    saveSystemToFile();
    return newFolder;
}

function saveSystemToFile() {
    makeSystemFlat();
    localStorage.setItem('file_system', JSON.stringify(flatSystem));
}

function readSystemFromFile() {
    tmpFsStorage = [];
    tmpLastId = 0;
    treatedNodes = 0;

    try {
        flatSystem = JSON.parse(localStorage.getItem('file_system'));
        checkIdsAreUnique();
        makeSystemTree();
        if(treatedNodes < flatSystem.length) throw new Error("Extra data");
        lastId = tmpLastId;
        fsStorage = tmpFsStorage;
        console.log('System was red successfully');
    } catch(e) {
        fsStorage = [];
        fsStorage.push(root);
    }
}

function makeSystemFlat() {
    var clone = {};
    flatSystem = [];

    for (var key in fsStorage[0]) {
        if(key != 'children') clone[key] = fsStorage[0][key];
    }
    clone['father'] = null;
    flatSystem.push(clone);
    putChildrensToFlat(fsStorage[0]);
}

function putChildrensToFlat( father) {

    father.children.forEach( function(node) {
        var clone = {};

        for (var key in node) {
            if(key != 'children') clone[key] = node[key];
        }
        clone['father'] = father['id'];
        flatSystem.push(clone);
        if(node.type == 'directory') putChildrensToFlat(node);
    });
}

function makeSystemTree() {
    if (flatSystem.length == 0) {
        tmpFsStorage.push(root);
        return;
    }

    for (var i = 0; i < flatSystem.length; i++) {
        if (flatSystem[i].id == 0) {  // find root
            nodeTreatment(tmpFsStorage, flatSystem[i]);
            break;
        }
    }
    if (!tmpFsStorage[0]) throw new Error('Wrong fields');
    addToSystemTreeChilds(tmpFsStorage[0]);
}

function nodeTreatment(container,node) {
    if(!checkFields(node)) throw new Error('Wrong fields');
    delete node.father;
    if(isFolder(node)) node['children'] = [];
    container.push(node);
    updateLastId(node.id);
    treatedNodes++;
}

function isFolder(node) {
    return node.type == 'directory';
}

function updateLastId(newId) {
    tmpLastId = newId > tmpLastId ? newId : lastId;
}

function addToSystemTreeChilds(father) {
    flatSystem.forEach(function(child, index) {
        if(child['father'] == father['id']) {
            nodeTreatment(father.children,child);
            if(isFolder(child)) addToSystemTreeChilds(child);
        }
    });
}

function checkIdsAreUnique() {
    var tmp = [];
    flatSystem.forEach( function(node) {
        if(!node['id'] && tmp.includes(node.id)) throw new Error('Not unique id');
        tmp.push(node.id);
    });
}

function checkFields(node) {
    return 'id' in node && 'father' in node && 'type' in node && 'name' in node &&
        ((node.type == 'file' && 'content' in node ) || node.type == 'directory');
}