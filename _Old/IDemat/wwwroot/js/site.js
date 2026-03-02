// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
//$("#btnmenuburger").click(function () {
//    $("#menu-burger").toggle();
//});

$('.step_wrapper').on('click', '.idematcardgrissurclic', function () {
    $(this).parent().find('.idematcardgrissurclic').css('background-color', '#FFFFFF');
    $(this).css('background-color', '#E0E0E0');
});