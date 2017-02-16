(function () {
    'use strict'


    var ABSENT = -1;
    var SPLIT_SIGN = '/';
    var ROOT = 0;


    var menuUl;
    var fullSystemList;
    var content;
    var currentFile = {};

//  event handlers

    function clickFileOrFolder(e) {
        e.stopPropagation();

        var id = $(this).data('id');
        if(id != fileSystem.myHistory[fileSystem.currentHistoryPosition]) {
            fileSystem.myHistory.splice(fileSystem.currentHistoryPosition + 1, fileSystem.myHistory.length); // check +1
            fileSystem.myHistory.push(id);
            fileSystem.currentHistoryPosition++;
        }
        expand(id, true);
        showContent(id);
        return false;
    }

    function clickExpander(e) {
        expand($(this).data('id'));
    }

    function clickAddFile(e) {
        e.stopPropagation();

        hideContextMenu();

        var id = $('.contextMenu').data('id');

        var father = fileSystem.findFile(fsStorage, id);
        var node = fileSystem.createFile(father, '');

        var upperUl = $('ul[data-id=' + id + ']');
        var li = $('<li name="node" data-id="' + node.id + '"></li>');
        var link = $('<a href="" data-id="' + node.id + '">' + node.name + '</a></li>');
        $(link).contextmenu(showContextMenu);
        $(link).click(clickFileOrFolder);
        li.appendTo(upperUl);
        li.addClass("hiden");
        li.append(link);
        showContent(id);
        return false;
    }

    function clickAddFolder(e) {
        e.stopPropagation();

        hideContextMenu();

        var id = $('.contextMenu').data('id');

        var father = fileSystem.findFile(fsStorage, id);
        var node = fileSystem.createFolder(father, '');
        var upperUl = $('ul[data-id=' + id + ']');

        var li = $('<li name="node" data-id="' + node.id + '"></li>');
        var link = $('<a href="" data-id="' + node.id + '" data-type="' + node.type + '">' + node.name + '</a></li>');
        $(link).click(clickFileOrFolder);
        $(link).contextmenu(showContextMenu);

        li.appendTo(upperUl);


        var button = $('<button class="expand" data-id="' + node.id + '">+</button>');
        $(button).click(clickExpander);
        li.addClass('directory');
        li.append(button).append(link);
        var ul = $('<ul data-id="' + node.id + '" class="hiden"></ul>');
        li.append(ul);
        showContent(id);
        return false;
    }

    function clickDelete(e) {
        e.stopPropagation();

        hideContextMenu();

        var id = $('.contextMenu').data('id');
        if (id == 0) {
            alert('You can not delete root');
            return false;
        }
        fileSystem.deleteFileOrFolder(id);
        $('li[data-id=' + id + ']').remove();
     //   $('ul[data-id=' + id + ']').remove();

        var contentId = $(content).attr("data_id");
        if(fileSystem.findFile(fsStorage, id) == undefined) {
            showContent(ROOT);
        }

        return false;
    }

    function clickRename(e) {
        e.stopPropagation();

        hideContextMenu();

        var id = $('.contextMenu').data('id');
        if (id == 0) {
            alert('You can not rename root');
            return false;
        }
        var father = fileSystem.findFather(id);
        setTimeout(function () {
            do {
                var name;

                name = prompt('Insert new name');

                if (name == null) return false;
            } while (fileSystem.usedName(father, name));
            var file = fileSystem.findFile(father.children, id);
            file.name = name;
            $('a[data-id=' + id + ']').text(name);
            showContent(father.id);
        }, 10);

        return false;
    }

    function clickBack() {
         while(fileSystem.currentHistoryPosition > 0 ) {
             fileSystem.currentHistoryPosition--;
            var id = fileSystem.myHistory[fileSystem.currentHistoryPosition];
            if( !fileSystem.findFile(fsStorage, id)) {
                fileSystem.myHistory.splice(fileSystem.currentHistoryPosition,1);
                continue;
            }

            showContent(id);
            break;
       }
        return false;
    }

    function clickForward() {
         while(fileSystem.currentHistoryPosition != fileSystem.myHistory.length - 1 ) {
             fileSystem.currentHistoryPosition++;
             var id = fileSystem.myHistory[fileSystem.currentHistoryPosition];
             if( !fileSystem.findFile(fsStorage, id)) {
                 fileSystem.myHistory.splice(fileSystem.currentHistoryPosition,1);
                 fileSystem.currentHistoryPosition--;
                 continue;
             }
             showContent(id);
             break;

          }
        return false;
    }

    function clickGo(e) {
        var path = $('input#path').val();
        var pathArray = path.split(SPLIT_SIGN);
        var id = fileSystem.getIdByPath(pathArray);
        if(id == ABSENT) {
            alert('Wrong path');
            return false;
        }

        showContent(id);
    }

    function clickSave(e) {
        currentFile.content = $('textarea.content').val();
    }

    function clickCancel(e) {
        $('textarea.content').val(currentFile.content);
    }

// add different types of menu
    function showContextMenu(e) {
        e.stopPropagation();
        var id = $(e.currentTarget).attr('data-id');
        var type = $(e.currentTarget).attr('data-type');
        if( id == undefined || type == undefined) return false;
        $('ul.contextMenu').css('left', e.pageX - 10 + 'px');
        $('ul.contextMenu').css('top', e.pageY - 10 + 'px');
        $('ul.contextMenu').attr('data-id', id);
        $('ul.contextMenu').data('id', id);
        $('ul.contextMenu').attr('data-type', type);
        $('ul.contextMenu').css('display', 'block');
        return false;
    }

    function hideContextMenu() {
        $(menuUl).css('display', 'none');
    }

// presentation

    function makeThree(node, upperUl) {
        var li = $('<li name="node" data-id="' + node.id + '"></li>');
        var link = $('<a href="" data-id="' + node.id + '" data-type="' + node.type + '">' + node.name + '</a></li>');
        $(link).click(clickFileOrFolder);
        $(link).contextmenu(showContextMenu);
        li.appendTo(upperUl);

        if (node['children']) {
            var button = $('<button class="expand" data-id="' + node.id + '">+</button>');
            $(button).click(clickExpander);
            li.addClass('directory');
            li.append(button).append(link);
            var ul = $('<ul data-id="' + node.id + '" class="hiden"></ul>');
            li.append(ul);
            if (node.children.length > 0) {
                node.children.forEach(function (child) {
                    makeThree(child, ul);
                });
            }
        } else {
            li.addClass("hiden");
            li.append(link);
        }
    }

    function showContent(id) {
        var path = fileSystem.findFullPath(id);
        $('input.path').val(path);

        var item = $('li[data-id=' + id + ']');

        $(content).html('');
        $(content).attr('data-type','content');
        $(content).attr('data-id',id);

        currentFile = fileSystem.findFile(fsStorage, id);

        if (item.hasClass('folder') || item.hasClass('directory')) {
            var emptyUl = $('<ul data-type="content"></ul>');
            $(content).append(content);
            var children = fileSystem.findChildren(fsStorage, id);
            children.forEach(function (child) {
                addChildToContent(content, child);
            });
        } else {
            var fileContent = currentFile.content;
            var text = $('<textarea name="fileContent" class="content">' + fileContent + '</textarea>');
            var buttonSave = $('<button class="content">Save</button>');
            var buttonCancel = $('<button class="content">Cancel</button>');
            $(buttonSave).click(clickSave);
            $(buttonCancel).click(clickCancel);
            $(content).append(text).append(buttonCancel).append(buttonSave);
        }
    }

    function addChildToContent(content, node) {// contextmenu="menu"
        var link = $('<li data-id="' + node.id + '"  data-type="' + node.type + '" class="' + node.type + '"><span>' + node.name + '</span> </li>');
        $(link).click(clickFileOrFolder);
        $(link).contextmenu(showContextMenu);
        $(content).append(link);
    }

    function expand(id, expandOnly) {
        var button = $('button[data-id=' + id + ']');
        var ul = $('ul[data-id=' + id + ']');

        if ($(ul).hasClass('hiden')) {
            $(button).text('-');
            showDir(ul);
        } else if (!expandOnly) {
            $(button).text('+');
            hideDir(ul);
        }
    }

    function showDir(ul) {
        $(ul).removeClass("hiden");
    }

    function hideDir(ul) {
        $(ul).addClass("hiden");
    }

    function init() {
        fileSystem.readSystemFromFile();
        var tmp = fsStorage;
        content = $('.content');
        content.contextmenu(showContextMenu);
        fullSystemList = $('.list');

        //context menu
        menuUl = $('ul.contextMenu');
        $('.contextMenu > #newFolder').click(clickAddFolder);
        $('.contextMenu > #newFile').click(clickAddFile);
        $('.contextMenu > #rename').click(clickRename);
        $('.contextMenu > #delete').click(clickDelete);
        $(window).click(hideContextMenu);
        // path
        $('input#go').val('root');
        $('button#go').click(clickGo);
        // history
        $('button#back').click(clickBack);
        $('button#forward').click(clickForward);
        //files three
        makeThree(fsStorage[0], fullSystemList);

    };

// begin execution

    $(document).ready(function () {
        init();

        $(this).bind("contextmenu", function(e) {
            e.preventDefault();
        });
    });
})( );


