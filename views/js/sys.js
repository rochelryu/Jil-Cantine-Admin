$(document).ready(function () {
    var socket = io();
    var inWait = "";

    $('.semaineA').on('change',
        function () {
            if($(this).is(':checked')){
                var ele = $(this).attr('data-ryu');
                ele = ele.trim();
                socket.emit('AddWeek', ele)
            }else {
                var ele = $(this).attr('data-ryu');
                ele = ele.trim();
                socket.emit('RemoveWeek', ele)
            }
        })
    $('#ecole').click(function () {
        var ecole = $("#ecoleName").val();
        socket.emit("newSchool", ecole);
        $("#ecoleList").prepend("<li class='animated swing slower'> "+ ecole +"</li>");
    })
    $('#motDepase').click(function () {
        var anc = $("#ancienPassword").val();
        var news = $("#newPassword").val();
        var confi = $("#confirmPassword").val();
        var ident = $("#ident").val();
        if(news == confi){
            socket.emit("changePass", {old:anc, news:news, confirm:confi, ident:ident});
        }
        else{
            new Toast({
                message: 'Le nouveau mot de passe et la confirmation ne sont pas identique',
                type: 'danger'
            });
        }
    });





    socket.on('changeRetour', function (data) {
            new Toast({
                message: data.mes,
                type: data.type
            });
    })
    $('.fake').click(function () {
        inWait = $(this).parent().parent().attr("id");
        var CliendId = $(this).parent().parent().attr("data-CliendId");
        var platId = $(this).parent().parent().attr("data-platId");
        var contain = $(this).parent().parent().attr("data-ryu");
        socket.emit("viewInWait", {CliendId:CliendId, platId:platId, contain:contain })
    });
    socket.on('RetourWait', function (data) {
        $('#myModalLabel').html(data.client.name + ' ' + data.client.firstname + ' | ' +data.client.numero);
        $('.modal-body .box-title h4').html("<i class=\"fa fa-plus\"></i>" + data.plat.tit)
        $('.modal-body .box-container ul').html("");
        for(let i in data.block){
            $('.modal-body .box-container ul').prepend("<li>"+ data.block[i].name  +"</li>")
        }

    })

    $('#final').click(function(){
        var selet = "#"+inWait;
        var ele = $(selet);
        $(selet).fadeOut(1000);
        console.log("fake "+ ele);
        socket.emit('LocalFinal', inWait);
        $(this).parent().find(".btn-secondary").click();
    })
})
