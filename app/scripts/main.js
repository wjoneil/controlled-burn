/* global _, Firebase, Handlebars  */
(function(){
    'use strict';


    // Set up firebase callbacks
    var firebase = new Firebase('http://scorching-fire-4039.firebaseio.com');
    var itemsRef = firebase.child('items');
    var itemTemplate = Handlebars.compile($('#item-template').html());

    itemsRef.on('child_added', function(snapshot) {
        new Item(_.extend(snapshot.val(), { key: snapshot.name() } ));
    });

    itemsRef.on('child_changed', function(snapshot) {
        var key = snapshot.name();
        $('#' + key + ' .itemText').text(snapshot.val().content);
    });

    itemsRef.on('child_removed', function(snapshot) {
        var key = snapshot.name();
        $('#' + key).slideUp('slow', function() { $(this).remove(); });

    });

    // Firebase interaction helpers
    var addItem = function(content) {
        itemsRef.push({ content: content });
    };

    var removeItem = function(key) {
        itemsRef.child(key).remove();
    };

    var updateItem = function(key, data) {
        itemsRef.child(key).update(data);
    };

    // helper for handling show/hide and per-item event binding
    function Item(data) {
        var newItem = $(itemTemplate(data));

        function beginEdit(item) {
            item.parent().hide();
            newItem.find('.itemEdit').show();
            newItem.find('.itemEdit > input').val(item.text()).focus();
        }

        function completeEdit(item, event) {
            item.parent().hide();
            newItem.find('.itemContent').show();
            updateItem(event.data.key, { content: item.val() });
        }

        newItem.on('click', '.itemRemove', { key: data.key }, function(event) {
            removeItem(event.data.key);
        }).on('click', '.itemText', function() {
            beginEdit($(this));
        }).on('blur', 'input', { key: data.key }, function(event) {
            completeEdit($(this), event);
        });
        newItem.appendTo('#item-container');
    }

    // hook up Add Item form
    $('#addNewItem').on('click', function () {
        var content = $('#newItemInput').val();
        $('#newItemInput').parent().removeClass('has-error');

        if (content === '') {
            $('#newItemInput').parent().addClass('has-error');
        } else {
            addItem(content);
            $('#newItemInput').val('');
        }
    });

}());
