"use strict";

var md5 = require('md5')

function partOne(){
    let password="";
    let zeros = "00000";
    let index = 0;
    let code = "ugkcyxxp"


    while (password.length < 8){

        let guess = code + index;
        let hash = md5(guess);
        if(hash.slice(0, zeros.length) == zeros ){
            password += hash[zeros.length];
        }
        ++index;
    }
    return password;
}

function updatePassword(pass, idx, val){
    if(idx>7)
        return pass;
    if(pass[idx]==="-"){
        var chars = pass.split("");
        chars[idx] = val;
        pass=chars.join("");
    }
    return pass;
}

function partTwo(){
    let password = "--------";
    let zeros = "00000";
    let index = 0;
    let code = "ugkcyxxp";

    while(password.indexOf("-") !== -1){
        let guess = code + index;
        let hash = md5(guess);
        if(hash.slice(0, zeros.length) == zeros ){
            password = updatePassword(password, hash[5], hash[6]);
        }
        ++index;
    }
    return password;
}

console.log("Part1=" + partOne());
console.log("Part2=" + partTwo());
