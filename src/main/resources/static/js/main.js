$(document).ready(function() {

    $.sort = {
        down: null,

        create: function() {
            this.down = $(".sort").hasClass('sort-down');
            $(".sort").on('click', function() {
                $.sort.change();
            });
        },

        change: function() {
            this.down = !this.down;
            this.update();
            $.todos.update();
        },

        update: function() {
            if (this.down) {
                $(".sort").addClass('sort-down');
                $(".sort .bi-sort-down").removeClass('d-none');
                $(".sort .bi-sort-up").addClass('d-none');
            }
            else {
                $(".sort").removeClass('sort-down');
                $(".sort .bi-sort-down").addClass('d-none');
                $(".sort .bi-sort-up").removeClass('d-none');
            }
        }
    };
    $.sort.create();

    $.calendar.create();
    $.calendar.setYM(new Date());
    $.calendar.update();

    $.todos.create();
    $.todos.load();

});

