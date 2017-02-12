'use strict'
//  event handlers

var currentFile = {};

function clickFileOrFolder(e) {
    e.stopPropagation();
    var id = $(this).data('id');
    history.length = currentHistoryPosition + 1;
    history.push(findFile(fsStorage,id));
    currentHistoryPosition++;
    expand(id,true);
    showContent(id);
    return false;
}

function clickExpander() {
    expand($(this).data('id'));
}

function clickAddFile() {
    e.stopPropagation();
    var id = $(this).data('id');

    var father = findFile(fsStorage,id);
    var node = createFile(father,'');

    var upperUl = $('ul[data-id=' + id + ']');
    var li = $('<li name="node" data-id="' +node.id + '"></li>');
    var link = $('<a href="" data-id="' +node.id + '">' + node.name +'</a></li>');
    $(link).click(clickFileOrFolder);
    li.appendTo(upperUl);
    li.addClass("hiden");
    li.append(link);
    return false;
}

function clickAddFolder(e) {
    e.stopPropagation();
    var id = $(this).data('id');

    var father = findFile(fsStorage,id);
    var node =createFolder(father,'');
    var upperUl = $('ul[data-id=' + id + ']');

    var li = $('<li name="node" data-id="' +node.id + '"></li>');
    var link = $('<a href="" data-id="' +node.id + '">' + node.name +'</a></li>');
    $(link).click(clickFileOrFolder);
    li.appendTo(upperUl);


    var button = $('<button class="expand" data-id="'+ node.id + '">+</button>');
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
    if(id == 0) {
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
    if(id == 0) {
        alert('You can not rename root');
        return false;
    }
    var father = findFather(id);
    do {
        var name = prompt('Isert new name');
        if (name == null) return false;
    } while(usedName(father,name));
    var file = findFile(father.children,id);
    file.name = name;
    $('li[data-id=' + id + ')').text(name);
    return false;
}

function clickBack() {
    e.stopPropagation();

    return false;
}

function clickForward() {}

function clickGo() {
    // read from input, parse string with '/' , find all path and show

    var path = $('input#path').val();
    console.log(path);
    // to parse
}

function clickSave() {
    currentFile.content = $('textarea.content').val();
}

function clickCancel() {
    $('textarea.content').val(currentFile.content);
}

// presentation

function makeThree(node, upperUl) {
    var li = $('<li name="node" data-id="' +node.id + '"></li>');
    var link = $('<a href="" data-id="' +node.id + '">' + node.name +'</a></li>');
    $(link).click(clickFileOrFolder);
    li.appendTo(upperUl);

    if (node['children'] ){
        var button = $('<button class="expand" data-id="'+ node.id + '">+</button>');
        $(button).click(clickExpander);
        li.addClass('folder');
        li.append(button).append(link);
        var ul = $('<ul data-id="' + node.id + '" class="hiden"></ul>');
        $(li).after(ul);
        if(node.children.length > 0) {
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
    var pass = findFullPass(id);
    $('input.pass').val(pass);

    var item = $('li:eq(' + id + ')');

    $('.content').html('');//remove();

    currentFile = findFile(fsStorage,id);

    if(item.hasClass('folder')) {
        var content = $('<ul></ul>');// data-id="' + id + '"
        $('.content').append(content);
        var children = findChildren(fsStorage,id);
        children.forEach(function(child) {
            addChildToContent(content,child);
        });
    } else {
        var fileContent = currentFile.content;
        console.log(currentFile);
        var text = $('<textarea name="fileContent" class="content">' + fileContent +'</textarea>');
        var buttonSave = $('<button class="content">Save</button>');
        var buttonCancel = $('<button class="content">Cancel</button>');
        $(buttonSave).click(clickSave);
        $(buttonCancel).click(clickCancel);
        $('.content').append(text).append(buttonCancel).append(buttonSave);
    }
}

function addChildToContent(content,node) {// contextmenu="menu"
    var link = $('<li  data-id="' +node.id + '" class="' + node.type +'"><span>' + node.name + '</span> </li>');
    $(link).click(clickFileOrFolder);
    $(content).append(link);
}

function expand(id,expandOnly) {
    var button = $('button[data-id=' + id + ']');
    var ul = $('ul[data-id=' + id + ']');

    if($(ul).hasClass('hiden')) {
        $(button).text('-');
        showDir(ul);
    }   else if(!expandOnly) {
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
    $('#contextMenu > #newFolder').click(clickAddFolder);
    $('#contextMenu > #newFile').click(clickAddFile);
    $('#contextMenu > #rename').click(clickRename);
    $('#contextMenu > #delete').click(clickDelete);
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

$(document).ready(function() {
  //  readSystemFromFile();
    init();

});









function showContextMenu(e) {
    var id = $(e.currentTarget).children('a').attr('data-id');
    $('menu#contextMenu').css('display', 'block');
    $('menu#contextMenu').css('left', e.pageX + 'px');
    $('menu#contextMenu').css('top', e.pageY + 'px');
    $('menu#contextMenu').data('id', id);
}

function hideContextMenu() {
    $('menu#contextMenu').css('display', 'none');
}




/*





 *
* showContextenu() {
*
*   $('fileBrowser').contextmanu() {
*   $('fileBrowser').css('display','block');
 *   $('fileBrowser').css('left',e.pageX + 'px');
 *   $('fileBrowser').css('right',e.pageY + 'px');
 *   $('fileBrowser').data('id', $(e.target).children('a').attr('data-id'));
 *   return false;
*   }
* }
*
* $(window).click(hideContentMenu);
* function hideContentMenu(){
* .css('display','none');
*
* func initContMenue(){
* $('#folderMenue > #newFolder').click(function(){
*   $('#folderManue').data('id');
*    createNewFolder(id); // inside folder(id) add to db and to show
*   }
* }
*
* css:
* menu{
*   width
*   height
*   display:none;
* }
* menuitem{
*
* }
* menuitem:hover {
* background-color: gray
*
* }
*
* */
