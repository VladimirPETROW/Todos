
$.modal = {
    create() {
        $(".modal-todo .modal-close").on("click", function() {
            $(".blackout").addClass("d-none");
            $(".modal-todo").hide();
        });
    },

    show(t) {
        $(".modal-todo .modal-title").html(t.name);
        $(".modal-todo .modal-date").html($.formatDate.withTime(new Date(t.date)));
        if (t.status) {
            $(".modal-todo .modal-status").removeClass("d-none");
        }
        else {
            $(".modal-todo .modal-status").addClass("d-none");
        }
        $(".modal-todo .modal-body").html(t.fullDesc);
        $(".blackout").removeClass("d-none");
        $(".modal-todo").show();
        $(".modal-todo .modal-body").scrollTop(0);
        $(".modal-todo .modal-body").scrollLeft(0);
    }
}

$.todos = {
    data: null,

    create() {
        $("#onlyOpened").on("change", function() {
            $.todos.update();
        });
    },

    load() {
        var from = $.calendar.begin;
        var to = $.calendar.end;
        if ((from == null) || (to == null)) {
            var html = "Выберите даты.";
            $(".list-todos").html(html);
            return;
        }
        var html = $.formatDate.withMonth(from);
        if (to.getTime() != from.getTime()) {
            html += " - " + $.formatDate.withMonth(to);
        }
        $(".date-info").html(html);
        html = "";
        $(".list-todos").html(html);

        from = new Date(from.getTime());
        to = new Date(to.getTime());
        to.setDate(to.getDate() + 1);
        to.setMilliseconds(to.getMilliseconds() - 1);
        $.ajax({
            method: "GET",
            url: "/api/todos/date/",
            data: {from: from.getTime(), to: to.getTime()}
        }).done(function(result) {
            $.todos.data = result;
            $.todos.update();
        }).fail(function(result) {
            var html = result.responseText;
            $(".list-todos").html(html);
        });
    },

    show(todo) {
        var id = $(todo).attr("todo");
        var t = this.data.find((elem) => elem.id == id);
        $.modal.show(t);
    },

    update() {
        var html;
        var data;
        //opened
        if ($("#onlyOpened").prop("checked")) {
            data = [];
            for (i = 0; i < this.data.length; i++) {
                if (!this.data[i].status) {
                    data.push(this.data[i]);
                }
            }
        }
        else {
            data = this.data.slice();
        }
        if (data.length == 0) {
            html = "Ничего не найдено";
            $(".list-todos").html(html);
            return;
        }
        //sort
        if ($.sort.down) {
            data.sort((a, b) => - ((new Date(a.date)).getTime() - (new Date(b.date)).getTime()));
        }
        else {
            data.sort((a, b) => ((new Date(a.date)).getTime() - (new Date(b.date)).getTime()));
        }
        html = "";
        for (i = 0; i < data.length; i++) {
            var t = data[i];
            html += "<div todo='" + t.id + "' class='row row-todo m-0 mb-3 ps-3 pe-3 pt-3' onclick='javascript:$.todos.show(this);'>" +
                        "<div class='col'>" +
                            "<div class='row fs-4 fw-bold'>" +
                                "<div class='col'>" + t.name + "</div>" +
                            "</div>" +
                            "<div class='row fs-4 pe-0'>" +
                                "<div class='col'>" + t.shortDesc + "</div>" +
                                "<div class='col text-end p-2'>" +
                                    "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-check-square bi-list' viewBox='0 0 16 16'>" +
                                      "<path d='M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z'/>" +
                                      (t.status ? "<path d='M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z'/>" : "") +
                                    "</svg>" +
                                "</div>" +
                            "</div>" +
                            "<div class='row text-end pe-0'>" +
                                "<div class='col p-2'>" + $.formatDate.withTime(new Date(t.date)) + "</div>" +
                            "</div>" +
                        "</div>" +
                    "</div>";
        }
        $(".list-todos").html(html);
    }
}

$.todosName = {
    data: null,

    message: null,

    create() {
        $("#search").on("keyup", function() {
            $.todosName.load();
        });
        $("#search").on("focusin", function() {
            $.todosName.load();
        });
        $("#search").on("focusout", function(event) {
            $(".list-todos-name").addClass('d-none');
        });
    },

    load() {
        var q = $("#search").val().trim();
        this.data = null;
        this.message = null;
        if (!q) {
            this.update();
            return;
        }
        $.ajax({
            method: "GET",
            url: "/api/todos/find/",
            data: {q: q}
        }).done(function(result) {
            $.todosName.data = result;
            $.todosName.update();
        }).fail(function(result) {
            $.todosName.message = result.responseText;
            $.todosName.update();
        });
    },

    show(todo) {
        var id = $(todo).attr("todo");
        var t = this.data.find((elem) => elem.id == id);
        $.modal.show(t);
    },

    update() {
        var html;
        if (this.data == null) {
            if (this.message == null) {
                html = "";
                $(".list-todos-name").html(html);
                $(".list-todos-name").addClass('d-none');
            }
            else {
                html = this.message;
                $(".list-todos-name").html(html);
                $(".list-todos-name").removeClass('d-none');
                $(".list-todos-name").scrollTop(0);
            }
            return;
        }
        if (this.data.length == 0) {
            html = "<center>Ничего не найдено</center>";
        }
        else {
            html = "";
            for (i = 0; i < this.data.length; i++) {
                var t = this.data[i];
                html += "<div todo='" + t.id + "' class='row row-todo-name p-1 m-0' onmousedown='javascript:$.todosName.show(this);'>" +
                            "<div class='col'>" + t.name + "</div>" +
                        "</div>";
            }
        }
        $(".list-todos-name").html(html);
        $(".list-todos-name").removeClass('d-none');
        $(".list-todos-name").scrollTop(0);
    }
}
