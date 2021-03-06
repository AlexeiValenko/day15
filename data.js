var fsStorage = [];


var fileSystem = (function() {
    'use strict'

    var ABSENT = -1;
/*
    var fsStorage = [{
        id: 0,
        name: 'root',
        type: 'folder',
        children: [{
            id: 1,
            name: 'file1.txt',
            type: 'file',
            content: '1111111'
        },

            {
                id: 2,
                name: 'sub1',
                type: 'folder',
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
        ]
    }
    ];
*/

//    var fsStorage = [];
    var flatSystem = [];
    var root = {
        id: 0,
        name: 'root',
        type: 'folder',
        children: []
    };

    fsStorage.push(root);
    var lastId = 0;

//    var lastId = 5;
    var tmpLastId = 0;
    var treatedNodes = 0;

    var myHistory = [];
//    myHistory.push(root);

    var currentHistoryPosition = -1;

    function childId(folder, index) {
        return folder.children[index].id;
    }

    function childName(folder, index) {
        return folder.children[index].name;
    }

    function childType(folder, index) {
        return folder.children[index].type;
    }

    function childContent(folder, index) {
        return folder.children[index].content;
    }

    function addChild(folder, content) {
        folder.children.push(content);
    }

    function deleteChild(folder, index) {
        folder.children.splice(index, 1);
    }

    function findFolderInArray(array, currentFolderId) {
        for (var i in array) {
            if (array[i].id == currentFolderId) {
                return array[i];
            } else {
                var resultFromChild = findFolderInArray(array[i].children, currentFolderId);
                if (resultFromChild) return resultFromChild;
            }
        }
    }

    function haveChildWithId(array, id) {
        for (var i in array) {
            if (array[i].id == id) return true;
        }
        return false;
    }

    function findChildren(array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id == id) {
                if (array[i].children) return array[i].children;
                else return;
            } else {
                if (array[i].children) {
                    var children = findChildren(array[i].children, id);
                    if(children) return children;
                }
            }
        }
    }

    function findFile(array, id) {
        var file;
        for (var i = 0; i < array.length; i++) {
            if (array[i].id == id) return array[i];
            if (array[i].children) {
                file = findFile(array[i].children, id);
                if (file) return file;
            }
        }
    }

    function findFatherRecursevly(array, id) {
        for (var i in array) {
            if (haveChildWithId(array[i].children, id)) {
                return array[i];
            } else {
                var resultFromChild = findFatherRecursevly(array[i].children, id);
                if (resultFromChild != 0) return resultFromChild;
            }
        }
        return 0;
    }

    function findFather(id) {
        return findFatherRecursevly(fsStorage, id);

    }

    function findFullPathRecursevly(array, id) {
        for (var i in array) {
            if (array[i].id == id) {
                return array[i].name;
            } else {
                var resultFromChild = findFullPathRecursevly(array[i].children, id);
                if (resultFromChild != '') return array[i].name + '/' + resultFromChild;
            }
        }
        return '';
    }

    function findFullPath(id) {
        return findFullPathRecursevly(fsStorage, id);

    }

    function getIdByPathRecursevly(path,current) {
        if(path[0] == current.name) {
            if(path.length == 1) return current.id;
            path.shift();
            if(current.type == 'file') return ABSENT;
            for(var i = 0; i < current.children.length; i++) {
                var id = getIdByPathRecursevly(path,current.children[i]);
                if(id != ABSENT) return id;
            }
        }
        return ABSENT;
    }

    function getIdByPath(path) {
        return getIdByPathRecursevly(path,fsStorage[0]);

    }

    function deleteFileOrFolder(id) {
        var father = findFather(id);
        for (var i in father.children) {
            if (childId(father, i) == id) {
                deleteChild(father, i);
                saveSystemToFile();
                return;
            }
        }
    }

    function usedName(father, name) {
        for (var i in father.children) {
            if (childName(father, i) == name) {
                return true;
            }
        }
        return false;
    }

    function existId(id, array) {
        var array = (array || fsStorage);
        for(var i = 0; i < array.length; i++) {
            if(array[i].id == id) return true;

            if(array[i].type == 'folder') {
                var result = existId(id,array[i].children);
                if(result) return result;
            }
        }
        return false;
    }

    function uniqueName(father, name) {
        var suffix = '';
        if (usedName(father, name)) {
            suffix = 1;
            while (usedName(father, name + suffix)) {
                suffix++;
            }
        }
        ;
        return name + suffix;
    }

    function createFile(father, content) {
        var name = uniqueName(father, 'New File');
        var newFile = {id: ++lastId, name: name, content: content, type: 'file'};
        addChild(father, newFile);
        saveSystemToFile();
        return newFile;
    }

    function createFolder(father) {
        var name = uniqueName(father, 'New Folder');
        var newFolder = {id: ++lastId, name: name, children: [], type: 'folder'}
        addChild(father, newFolder);
        saveSystemToFile();
        return newFolder;
    }

    function saveSystemToFile() {
        makeSystemFlat();
        localStorage.setItem('file_system', JSON.stringify(flatSystem));
    }

    function readSystemFromFile() {
        fsStorage = [];
        tmpLastId = 0;
        treatedNodes = 0;

        try {
            flatSystem = JSON.parse(localStorage.getItem('file_system'));
            checkIdsAreUnique();
            makeSystemTree();
            if (treatedNodes < flatSystem.length) throw new Error("Extra data");
            lastId = tmpLastId;
          //  console.log('System was red successfully');
        } catch (e) {
            fsStorage = [];
            fsStorage.push(root);
        }
    }

    function makeSystemFlat() {
        var clone = {};
        flatSystem = [];

        for (var key in fsStorage[0]) {
            if (key != 'children') clone[key] = fsStorage[0][key];
        }
        clone['father'] = null;
        flatSystem.push(clone);
        putChildrensToFlat(fsStorage[0]);
    }

    function putChildrensToFlat(father) {

        father.children.forEach(function (node) {
            var clone = {};

            for (var key in node) {
                if (key != 'children') clone[key] = node[key];
            }
            clone['father'] = father['id'];
            flatSystem.push(clone);
            if (node.type == 'folder') putChildrensToFlat(node);
        });
    }

    function makeSystemTree() {
        if (flatSystem.length == 0) {
            fsStorage.push(root);
            return;
        }

        for (var i = 0; i < flatSystem.length; i++) {
            if (flatSystem[i].id == 0) {  // find root
                nodeTreatment(fsStorage, flatSystem[i]);
                break;
            }
        }
        if (!fsStorage[0]) throw new Error('Wrong fields');
        addToSystemTreeChilds(fsStorage[0]);
    }

    function nodeTreatment(container, node) {
        if (!checkFields(node)) throw new Error('Wrong fields');
        delete node.father;
        if (isFolder(node)) node['children'] = [];
        container.push(node);
        updateLastId(node.id);
        treatedNodes++;
    }

    function isFolder(node) {
        return node.type == 'folder';
    }

    function updateLastId(newId) {
        tmpLastId = newId > tmpLastId ? newId : lastId;
    }

    function addToSystemTreeChilds(father) {
        flatSystem.forEach(function (child, index) {
            if (child['father'] == father['id']) {
                nodeTreatment(father.children, child);
                if (isFolder(child)) addToSystemTreeChilds(child);
            }
        });
    }

    function checkIdsAreUnique() {
        var tmp = [];
        flatSystem.forEach(function (node) {
            if (!node['id'] && tmp.includes(node.id)) throw new Error('Not unique id');
            tmp.push(node.id);
        });
    }

    function checkFields(node) {
        return 'id' in node && 'father' in node && 'type' in node && 'name' in node &&
            ((node.type == 'file' && 'content' in node ) || node.type == 'folder');
    }

    return {
       // fsStorage: fsStorage,
        myHistory: myHistory,
        currentHistoryPosition: currentHistoryPosition,
        findFile: findFile,
        findChildren: findChildren,
        findFather: findFather,
        findFullPath: findFullPath,
        createFile: createFile,
        createFolder: createFolder,
        deleteFileOrFolder: deleteFileOrFolder,
        usedName: usedName,
        getIdByPath: getIdByPath,
        readSystemFromFile: readSystemFromFile,
        saveSystemToFile: saveSystemToFile,
    }

})();