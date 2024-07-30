
$.formatDate = {
    monthNames: ["января", "февраля", "мартф", "фпреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],

    withMonth: function(date) {
        return date.getDate() + ' ' + this.monthNames[date.getMonth()] + ' ' + date.getFullYear();
    },

    withTime: function(date) {
        return (new String(date.getDate())).padStart(2, '0') + '.' + (new String(date.getMonth() + 1)).padStart(2, '0') + '.' + date.getFullYear() +
                ' ' + (new String(date.getHours())).padStart(2, '0') + ':' + (new String(date.getMinutes())).padStart(2, '0');
    }
};

$.calendar = {
    year: null,
    month: null,
    begin: null,
    end: null,

    monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    daysNames: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],

    create: function() {
        $(".btn-now").on('click', function() {
            var date = new Date();
            $.calendar.setPeriod(date, date);
        });

        $(".btn-week").on('click', function() {
            var date = new Date();
            $.calendar.setWeek(date);
        });
    },

    setYM: function(date) {
        this.year = date.getFullYear();
        this.month = date.getMonth();
    },

    setPeriod: function(begin, end) {
        this.begin = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate());
        this.end = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        this.periodUpdated();
        this.update();
    },

    setWeek: function(date) {
        var dW = date.getDay() - 1;
        dW = dW < 0 ? 6 : dW;
        var dM = date.getDate();
        var dB = dM - dW;
        if (dB < 1) {
            dB = 1;
        }
        var dE = dM - dW + 6;
        var dMLast = (new Date(date.getFullYear(), date.getMonth() + 1, 0)).getDate();
        if (dE > dMLast) {
            dE = dMLast;
        }
        this.begin = new Date(date.getFullYear(), date.getMonth(), dB);
        this.end = new Date(date.getFullYear(), date.getMonth(), dE);
        this.periodUpdated();
        this.update();
    },

    period: function(td) {
        var date = new Date();
        var time = $(td).attr("date");
        date.setTime(time);
        if (this.begin == null) {
            this.begin = date;
        }
        else {
            if (this.end == null) {
                if (this.begin.getTime() > date.getTime()) {
                    this.end = this.begin;
                    this.begin = date;
                }
                else {
                    this.end = date;
                }
                this.periodUpdated();
            }
            else {
                this.begin = date;
                this.end = null;
            }
        }
        this.update();
    },

    periodUpdated: function() {
        $.todos.load();
    },

    prevMonth: function() {
        var date = new Date(this.year, this.month - 1);
        this.setYM(date);
        this.update();
    },

    nextMonth: function() {
        var date = new Date(this.year, this.month + 1);
        this.setYM(date);
        this.update();
    },

    update: function() {
        var now = new Date();
        var current = (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
        var begin = null;
        var end = null;
        if (this.begin != null) {
            begin = this.begin.getTime();
            if (this.end != null) {
                end = this.end.getTime();
            }
        }
        var html = "<table class='w-100 calendar'><tbody>";
        html += "<tr class='bg-light'><td colSpan='7'><div class='row w-100 m-0 align-items-center'>" +
                    "<div class='col-2 p-0'><button class='btn btn-light w-100' onclick='javascript:$.calendar.prevMonth();'>&lt;</button></div>" +
                    "<div class='col'>" + this.monthNames[this.month] + ' ' + this.year + "</div>" +
                    "<div class='col-2 p-0'><button class='btn btn-light w-100' onclick='javascript:$.calendar.nextMonth();'>&gt;</button></div>" +
                "</div></td></tr>";
        html += "<tr class='bg-light'>";
        for (i = 0; i < this.daysNames.length; i++) {
            html += "<td>" + this.daysNames[i] + "</td>";
        }
        html += "</tr>";
        var htmlDate = function(calendar, day, current) {
            var cl = '';
            var dT = (new Date(calendar.year, calendar.month, day)).getTime();
            if (dT == current) {
                cl += "date-current";
            }
            if ((begin != null) && (end != null)) {
                if ((dT >= begin) && (dT <= end)) {
                    cl += " date-period";
                }
            }
            return "<td date='" + dT + "' class='date " + cl + "' onclick='javascript:$.calendar.period(this);'>" + day + "</td>";
        };
        html += "<tr>";
        var dM = 1;
        var first = new Date(this.year, this.month, dM);
        var dMLast = new Date(this.year, this.month + 1, 0).getDate();
        var dW = first.getDay() - 1;
        dW = dW < 0 ? 6 : dW;
        if (dW > 0) {
            html += "<td colSpan='" + dW + "'></td>";
        }
        for (i = dW; i < 7; i++) {
            html += htmlDate(this, dM, current);
            dM++;
        }
        html += "</tr>";
        for (;;) {
            html += "<tr>";
            for (i = 0; i < 7; i++) {
                html += htmlDate(this, dM, current);
                dM++;
            }
            html += "</tr>";
            if ((dMLast - dM) < 7) break;
        }
        if (dM < dMLast) {
            html += "<tr>";
            for (dW = 0; dM <= dMLast; dW++) {
                html += htmlDate(this, dM, current);
                dM++;
            }
            html += "<td colSpan='" + (7 - dW) + "'></td></tr>";
        }
        html += "<tr class='bg-light'><td colSpan='7'><div class='p-2 w-100'>";
        if ((this.begin != null) && (this.end == null)) {
            html += "Дата начала диапазона: " + (new String(this.begin.getDate())).padStart(2, '0') + '.' + (new String(this.begin.getMonth() + 1)).padStart(2, '0') + '.' + this.begin.getFullYear();
        }
        else {
            html += '&nbsp;';
        }
        html += "</div></td></tr></tbody></table>";

        $(".calendar").html(html);
    }
};
