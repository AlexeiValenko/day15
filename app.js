(function () {
    'use strict'

    var menuUl;

    var currentFile = {};

//  event handlers

    function clickFileOrFolder(e) {
        e.stopPropagation();

        var id = $(this).data('id');
        if(id != myHistory[currentHistoryPosition].id) {
            myHistory.splice(currentHistoryPosition + 1, myHistory.length); // check +1
            myHistory.push(findFile(fsStorage, id));
            currentHistoryPosition++;
        }
        expand(id, true);
        showContent(id);
        return false;
    }

    function clickExpander() {
        expand($(this).data('id'));
    }

    function clickAddFile() {
        e.stopPropagation();
        var id = $(this).data('id');

        var father = findFile(fsStorage, id);
        var node = createFile(father, '');

        var upperUl = $('ul[data-id=' + id + ']');
        var li = $('<li name="node" data-id="' + node.id + '"></li>');
        var link = $('<a href="" data-id="' + node.id + '">' + node.name + '</a></li>');
        $(li).contextmenu(showContextMenu);
        $(link).click(clickFileOrFolder);
        li.appendTo(upperUl);
        li.addClass("hiden");
        li.append(link);
        return false;
    }

    function clickAddFolder(e) {
        e.stopPropagation();
        var id = $(this).data('id');

        var father = findFile(fsStorage, id);
        var node = createFolder(father, '');
        var upperUl = $('ul[data-id=' + id + ']');

        var li = $('<li name="node" data-id="' + node.id + '"></li>');
        var link = $('<a href="" data-id="' + node.id + '">' + node.name + '</a></li>');
        $(link).click(clickFileOrFolder);
        $(li).contextmenu(showContextMenu);

        li.appendTo(upperUl);


        var button = $('<button class="expand" data-id="' + node.id + '">+</button>');
        $(button).click(clickExpander);
        li.addClass('folder');
        li.append(button).append(link);
        var ul = $('<ul data-id="' + node.id + '" class="hiden"></ul>');
        $(li).after(ul);
        return false;
    }

    function clickDelete(e) {
        e.stopPropagation();
        var id = $(this).data('id');
        if (id == 0) {
            alert('You can not delete root');
            return false;
        }
        deleteFileOrFolder(id);
        $('li[data-id=' + id + ')').remove();
        return false;
    }

    function clickRename(e) {
        e.stopPropagation();
        var id = $(this).data('id');
        if (id == 0) {
            alert('You can not rename root');
            return false;
        }
        var father = findFather(id);
        do {
            var name = prompt('Incert new name');
            if (name == null) return false;
        } while (usedName(father, name));
        var file = findFile(father.children, id);
        file.name = name;
        $('li[data-id=' + id + ')').text(name);
        return false;
    }

    function clickBack() {
        e.stopPropagation();
        while(currentHistoryPosition != - 1 ) {
            currentHistoryPosition--;
            var id = myHistory[currentHistoryPosition].id;
            if(id == -1) continue;
            showContent(id);
            break;
        }
        return false;
    }

    function clickForward() {
        e.stopPropagation();
        while(currentHistoryPosition != myHistory.length - 1 ) {
            currentHistoryPosition++;
            var id = myHistory[currentHistoryPosition].id;
            if(id == -1) continue;
            showContent(id);
            break;
        }
        return false;
    }

    function clickGo() {
        var path = $('input#path').val();
        var pathArray = path.split('/');
        var id = getIdByPath(pathArray);
        if(id == -1) {
            alert('Wrong path');
            return false;
        }

        showContent(id);
    }

    function clickSave() {
        currentFile.content = $('textarea.content').val();
    }

    function clickCancel() {
        $('textarea.content').val(currentFile.content);
    }


    function showContextMenu(e) {
        e.stopPropagation();
        var id = $(e.currentTarget).children('a').attr('data-id');
        $('.contexMenu').css('display','block');
        $('.contextMenu').css('display', 'block');
        $('.contextMenu').css('left', e.pageX - 10 + 'px');
        $('.contextMenu').css('top', e.pageY - 10 + 'px');
        $('.contextMenu').data('id', id);
        return false;
    }

    function hideContextMenu() {
        $(menuUl).css('display', 'none');
    }

// presentation

    function makeThree(node, upperUl) {
        var li = $('<li name="node" data-id="' + node.id + '"></li>');
        var link = $('<a href="" data-id="' + node.id + '">' + node.name + '</a></li>');
        $(link).click(clickFileOrFolder);
        $(li).contextmenu(showContextMenu);
        li.appendTo(upperUl);

        if (node['children']) {
            var button = $('<button class="expand" data-id="' + node.id + '">+</button>');
            $(button).click(clickExpander);
            li.addClass('folder');
            li.append(button).append(link);
            var ul = $('<ul data-id="' + node.id + '" class="hiden"></ul>');
            $(li).after(ul);
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
        var path = findFullPath(id);
        $('input.path').val(path);

        var item = $('li[data-id=' + id + ']');

        $('.content').html('');//remove();

        currentFile = findFile(fsStorage, id);

        if (item.hasClass('folder')) {
            var content = $('<ul></ul>');// data-id="' + id + '"
            $('.content').append(content);
            var children = findChildren(fsStorage, id);
            children.forEach(function (child) {
                addChildToContent(content, child);
            });
        } else {
            var fileContent = currentFile.content;
            console.log(currentFile);
            var text = $('<textarea name="fileContent" class="content">' + fileContent + '</textarea>');
            var buttonSave = $('<button class="content">Save</button>');
            var buttonCancel = $('<button class="content">Cancel</button>');
            $(buttonSave).click(clickSave);
            $(buttonCancel).click(clickCancel);
            $('.content').append(text).append(buttonCancel).append(buttonSave);
        }
    }

    function addChildToContent(content, node) {// contextmenu="menu"
        var link = $('<li  data-id="' + node.id + '" class="' + node.type + '"><span>' + node.name + '</span> </li>');
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
        //context menu
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
        makeThree(fsStorage[0], $('.list'));

    };

// begin execution

    $(document).ready(function () {


        menuUl = $('ul.contextMenu');



        //  readSystemFromFile();
        init();

        $(this).bind("contextmenu", function(e) {
            e.preventDefault();
        });
        /*
        $(document).on('contextmenu', function (e) {
            e.stopPropagation();
            console.log('stop context');
           return false;
        });
*/
    });


})( );


