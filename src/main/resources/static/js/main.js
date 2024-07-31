$(document).ready(function() {

    $.sort = {
        down: null,

        create() {
            this.down = !$(".sort-down").hasClass('d-none');
            $(".sort").on('click', function() {
                $.sort.change();
            });
        },

        change() {
            this.down = !this.down;
            this.update();
            $.todos.update();
        },

        update() {
            if (this.down) {
                $(".sort-down").removeClass('d-none');
                $(".sort-up").addClass('d-none');
            }
            else {
                $(".sort-down").addClass('d-none');
                $(".sort-up").removeClass('d-none');
            }
        }
    };
    $.sort.create();

    $.modal.create();

    $.calendar.create();
    $.calendar.setYM(new Date());
    $.calendar.update();

    $.todos.create();
    $.todos.load();

    $.todosName.create();
});

