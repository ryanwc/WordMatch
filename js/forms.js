function readyTags(tagNameToGroup, tagGroupToName) {

    // set up the tag area
    $("#add").click(function() {

        var newtag = false;
        var needsIdentifier = false;

        // if the #newtagquestion is displayed, the user already tried to enter a tag, but
        // it wasn't in our system yet, so prompted them to tell us more about the tag,
        // then click "add" again.
        // if this condition is false, it might be set to true in the code below if it is a tag
        // we do not have in the system.
        if (!$("#newtagquestion").hasClass("displaynone")) {

            newtag = true;
            $("#chosentaggroup").html($("input:radio[name=tagtype]:checked").val());
            toggleDisplay($("#newtagquestion"));
        }

        if (!$("#tagidentifiers").hasClass("displaynone")) {

            needsIdentifier = true;
            $("#chosentagidentifier").html($("input:radio[name=tagidentifier]:checked").val());
            toggleDisplay($("#tagidentifiers"));
        }

        // keep rest of validation in case user tries to insert weird stuff when newtag=true

        var inputTag = $("#tagname").val().toLowerCase();
        var dreamTags = $(".dreamtagname");

        if (inputTag.length > 0) {

            // to try to accomodate other languages, do not do something like "[^a-zA-Z ]"
            if (inputTag.match(/[1234567890~!@#\$\+=%\^&\*\(\)<>,\.\/\?;:\[\]\{\}\|_\\]/)) {

                $("#tagnamemessageprefix").html("<br>");
                addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
                $("#tagnamemessage").html("Tag name contains an illegal character. Try using only letters, spaces, hyphens, and apostrophes. ");
                return;
            }

            if (inputTag.match(/  /)) {

                $("#tagnamemessageprefix").html("<br>");
                addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
                $("#tagnamemessage").html("Tag name cannot contain more than one space in a row. ");
                return;
            }

            if (inputTag.match(/''/)) {

                $("#tagnamemessageprefix").html("<br>");
                addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
                $("#tagnamemessage").html("Tag name cannot contain more than one apostrophe in a row. ");
                return;
            }

            if (inputTag.match(/--/)) {

                $("#tagnamemessageprefix").html("<br>");
                addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
                $("#tagnamemessage").html("Tag name cannot contain more than one hypen in a row. ");
                return;
            }

            var tagGroup;

            // if the tag name exists, assign the tag group
            // if not, check if we know about its group yet, and if not, ask about its group
            // if so, get the group already input
            if (tagNameToGroup[inputTag]) {

                tagGroup = tagNameToGroup[inputTag];
            }
            else if (newtag == false && $("#chosentaggroup").html() == "none") {
                
                toggleDisplay($("#newtagquestion"));
                $("#defaulttagtype").prop("checked", true);
                addAndRemoveClasses($("#tagnamemessage"), "valid", "invalid");
                $("#tagnamemessageprefix").html("<br>");         
                $("#tagnamemessage").html("Gathering information about the new '" + inputTag + "' dream tag... ");
                return;
            }
            else {

                tagGroup = $("#chosentaggroup").html();
            }

            var identifier;

            // candidate for refactor (let's be honest, a lot of this file is a candidate)
            // if it needs an identifier, ask for it
            if ( (tagGroup == "object" || tagGroup == "place" ||
                  tagGroup == "being" || tagGroup == "emotion") &&
                needsIdentifier == false) {

                toggleDisplay($("#tagidentifiers"));
                $("#defaulttagidentifier").prop("checked", true);
                $("#tagtobeidentified").html("'"+inputTag+"' "+tagGroup);
                addAndRemoveClasses($("#tagnamemessage"), "valid", "invalid");
                $("#tagnamemessageprefix").html("<br>");
                $("#tagnamemessage").html("Getting identifier for the '" + inputTag + "' dream tag... ");

                displayTagIdentifierText(tagGroup);
                return;  
            }
            else {

                identifier = $("#chosentagidentifier").html();
            }

            // create the tag button and then reset everything
            createAndAppendTagButton(inputTag, tagGroup, identifier);
            
            $("#chosentaggroup").html("none");
            $("#chosentagidentifier").html("none");          
            addAndRemoveClasses($("#tagnamemessage"), "valid", "invalid");
            $("#tagnamemessageprefix").html("<br>");
            $("#tagnamemessage").html("Added the '" + tagGroup + ": " + inputTag + "' tag ");
            $("#tagname").val("");
            $("#tagname").focus();
        }

    });

    // add tag with pressing enter
    document.getElementById("tagname").addEventListener("keyup", function(event) {
        
        if (event.keyCode == 13) {

            event.preventDefault();
            document.getElementById("add").click();
        }
    });
    document.getElementById("tagname").addEventListener("keydown", function(event) {
        
        if (event.keyCode == 13) {

            event.preventDefault();
        }
    });
    document.getElementById("tagname").addEventListener("keypress", function(event) {
        
        if (event.keyCode == 13) {

            event.preventDefault();
        }
    });

    if ($("input:radio[name=lucidity]:checked").val() == "True") {

        toggleLucidQuestions();
    }
}

function resetTagTextInput() {

    resetMessage('tagname'); 
    hide($('#newtagquestion'));
    hide($('#tagidentifiers'));
    $("#chosentaggroup").html("none");

}

function displayTagIdentifierText(tagGroup) {

    // toggle off all specific identifier text, then display the correct text
    $(".tagidentifiertext").each(function() {

        addAndRemoveClasses($(this), "displaynone", "");
    });

    var tagGroupToDisplay = tagGroup + "identifiertext";

    $("."+tagGroupToDisplay).each(function() {

        addAndRemoveClasses($(this), "", "displaynone");
    });
}

function createAndAppendTagButton(tagname, type, identifier) {

    var id = tagname+"Button";

    var identifierText;

    switch (identifier) {

        case "definite":
            identifierText = "(the) ";
            break;
        case "indefinite":
            identifierText = "(a(n)/another's) ";
            break;
        case "possesive":
            identifierText = "(my) ";
            break;
        default:
            identifierText = "";
            identifier = "none";
            break;
    }

    var removeTagButton = $("<button id=\""+id+"\" class=\"tag tagbutton remove "+type+"\" value=\""+tagname+"|"+identifier+"@"+type+"\"><span class=\"dreamtag\">"+identifierText+"<span class=\"dreamtagname\">"+tagname+"</span></span> <span class=\"removetext\">(remove)</span></button>");

    removeTagButton.click(function() {

        $("#tagnamemessageprefix").html("<br>");
        $("#tagnamemessage").html("Removed '" + type + ": " +  tagname + "' tag ");
        $(this).remove();
        $("#tagname").focus();
    });

    $("#tags").append(removeTagButton);
}

function hide(element) {

    if (!element.hasClass("displaynone")) {

        element.addClass("displaynone");
    }
}

function toggleDisplay(element) {

    if (element.hasClass("displaynone")) {

        element.removeClass("displaynone");
    }
    else {

        element.addClass("displaynone");
    }
}

function toggleVisible(element) {

    if (!element.hasClass("visible")) {

        element.addClass("visible");
    }
    else {

        element.removeClass("visible");
    }
}

function toggleLucidQuestions() {

    if ($("input:radio[name=lucidity]:checked").val() == "False") {

        $(".lucidity").each(function() {

            $(this).addClass("displaynone");
        });
    }
    else {

        $(".lucidity").each(function() {

            $(this).removeClass("displaynone");
        });
    }
}

function toggleSomethingElse() {

    if ($("#lucidreason").val() == "something else") {

        $("#somethingelse").removeClass("displaynone");
    }
    else {

        if (!$("#somethingelse").hasClass("displaynone")) {

          $("#somethingelse").addClass("displaynone");
        }
    }
}

function toggleSpecificCheck() {

    if ($("input:radio[name=dreamsignbool]:checked").val() == "True") {

        addAndRemoveClasses($("#dreamsignquestion"), "", "displaynone");
        addAndRemoveClasses($("#realitycheckquestion"), "displaynone", "");
    }
    else if ($("input:radio[name=dreamsignbool]:checked").val() == "False") {

        addAndRemoveClasses($("#dreamsignquestion"), "displaynone", "");
        addAndRemoveClasses($("#realitycheckquestion"), "", "displaynone");
    }
}

function toggleOtherRealityCheck() {

    if ($("#realitycheck").val() == "4") {

        $("#otherrealitycheck").removeClass("displaynone");
    }
    else {

        if (!$("#otherrealitycheck").hasClass("displaynone")) {

          $("#otherrealitycheck").addClass("displaynone");
        }
    }
}

function addAndRemoveClasses(element, classToAdd, classToRemove) {

    if (element.hasClass(classToRemove)) {

        element.removeClass(classToRemove);
    }

    if (!element.hasClass(classToAdd)) {

        element.addClass(classToAdd);
    }
}

function validateNewUser(countries, professions, industries, educationLevels) {

    var username = $("#username").val();
    var password = $("#password").val();
    var verifyPassword = $("#verifypassword").val();
    var gender = $("input:radio[name=gender]:checked").val();
    var birthdate = $("#birthdate").val();
    var nationality = $("#nationality").val();
    var residence = $("#residence").val();
    var area = $("input:radio[name=area]:checked").val();
    var email = $("#email").val();
    var profession = $("#profession").val();
    var industry = $("#industry").val();
    var sector = $("#sector").val();
    var education_level = $("#educationlevel").val();
    var isParent = $("input:radio[name=isparent]:checked").val();
    var isCommitted = $("input:radio[name=iscommitted]:checked").val();

    var containsError = false;

    // does not verify all that should be present are present, but verifies the ones that are
    var satisfaction_rating_input_divs = $(".ratingareaslider");
    var thisRating;
    satisfaction_rating_input_divs.each(function() {

        thisRating = $(this).val();
        thisID = $(this).attr("id");

        if (!validateSatisfactionRating(thisRating, thisID)) {

            containsError = true;
        }
    });

    if (!validateUsername(username)) {

        containsError = true;
    }

    if (!validatePassword(password)) {

        containsError = true;
    }

    if (!validateVerifyPassword(password, verifyPassword)) {

        containsError = true;
    }

    if (!validateGender(gender)) {

        containsError = true;
    }

    if (!validateBirthdate(birthdate)) {

        containsError = true;
    }

    if (!validateNationality(nationality, countries)) {

        containsError = true;
    }

    if (!validateResidence(residence, countries)) {

        containsError = true;
    }

    if (!validateEmail(email)) {

        containsError = true;
    }

    if (!validateProfession(profession, professions)) {

        containsError = true;
    }

    if (!validateArea(area)) {

        containsError = true;
    }

    if (profession != "Student" && 
        profession != "Retired" && 
        profession != "Unemployed") {
        
        if (!validateIndustry(industry, industries)) {

            containsError = true;
        }
    }

    if (profession != "Retired" && 
        profession != "Unemployed") {
    
        if (!validateSector(sector)) {

            containsError = true;
        }
    }

    if (!validateEducationLevel(education_level, educationLevels)) {

        containsError = true;
    }

    if (!validateParent(isParent)) {

        containsError = true;
    }

    if (!validateCommitted(isCommitted)) {

        containsError = true;
    }

    if (containsError) {

        window.alert("One of the values you entered is in the wrong format or contains an error.  Please look for red text near each question for guidance, then revise and re-submit.");
        return false;
    }

    return true;
}

function validateSatisfactionRating(ratingString, id) {

    if (ratingString.length < 1) {

        addAndRemoveClasses($("#"+id+"message"), "invalid", "valid");
        $("#"+id+"message").html("Please use the slider to pick a value. ");
        return false;
    }

    var rating = parseInt(rating);

    // will return false if NaN
    if (rating < 0 || rating > 10) {

        addAndRemoveClasses($("#"+id+"messageprefix"), "invalid", "valid");
        $("#"+id+"message").html("Please rate how enjoyable the dream was.");
        return false;
    }

    addAndRemoveClasses($("#"+id+"message"), "valid", "invalid");
    $("#"+id+"message").html("Rating OK.");
    return true;
}

function validateUsername(username) {

    $("#usernamemessageprefix").html("<br>");

    if (username.length < 3) {

        addAndRemoveClasses($("#usernamemessage"), "invalid", "valid");
        $("#usernamemessage").html("Username too short.");
        return false;
    }

    if (username.length > 20) {

        addAndRemoveClasses($("#usernamemessage"), "invalid", "valid");
        $("#usernamemessage").html("Username too long.");
        return false;
    }

    if (username.match(/[^a-zA-Z0-9_-]/)) {

        addAndRemoveClasses($("#usernamemessage"), "invalid", "valid");
        $("#usernamemessage").html("Username contains illegal character.");
        return false;
    }

    addAndRemoveClasses($("#usernamemessage"), "valid", "invalid");
    $("#usernamemessage").html("Username OK.");
    return true;
}

function validatePassword(password) {

    $("#passwordmessageprefix").html("<br>");

    if (password.length < 6) {

        addAndRemoveClasses($("#passwordmessage"), "invalid", "valid");
        $("#passwordmessage").html("Password too short.");
        return false;
    }

    if (password.length > 20) {

        addAndRemoveClasses($("#passwordmessage"), "invalid", "valid");
        $("#passwordmessage").html("Password too long.");
        return false;
    }

    if (!password.match(/[\!@\#\$%\^&\*]/)) {

        addAndRemoveClasses($("#passwordmessage"), "invalid", "valid");
        $("#passwordmessage").html("Password must have a special character.");
        return false;
    }

    if (!password.match(/[0-9]/)) {

        addAndRemoveClasses($("#passwordmessage"), "invalid", "valid");
        $("#passwordmessage").html("Password must have a number.");
        return false;
    }

    if (!password.match(/[a-z]/)) {

        addAndRemoveClasses($("#passwordmessage"), "invalid", "valid");
        $("#passwordmessage").html("Password must have a lower case letter.");
        return false;
    }

    if (!password.match(/[A-Z]/)) {

        addAndRemoveClasses($("#passwordmessage"), "invalid", "valid");
        $("#passwordmessage").html("Password must have an upper case letter.");
        return false;
    }    

    addAndRemoveClasses($("#passwordmessage"), "valid", "invalid");
    $("#passwordmessage").html("Password OK.");
    return true;
}

function validateVerifyPassword(password, verifypassword) {

    $("#verifypasswordmessageprefix").html("<br>");

    if (password != verifypassword) {

        addAndRemoveClasses($("#verifypasswordmessage"), "invalid", "valid");
        $("#verifypasswordmessage").html("Passwords do not match.");
        return false;
    }

    addAndRemoveClasses($("#verifypasswordmessage"), "valid", "invalid");
    $("#verifypasswordmessage").html("Password match OK.");
    return true;
}

function validateGender(gender) {

    $("#gendermessageprefix").html("<br>");

    if (typeof gender == 'undefined') {

        addAndRemoveClasses($("#gendermessage"), "invalid", "valid");
        $("#gendermessage").html("Please select your gender.");
        return false;
    }

    if (gender.length < 1) {

        addAndRemoveClasses($("#gendermessage"), "invalid", "valid");
        $("#gendermessage").html("Please select your gender.");
        return false;
    }

    if (gender != "Male" && gender != "Female" && gender != "Non-binary") {

        addAndRemoveClasses($("#gendermessage"), "invalid", "valid");
        $("#gendermessage").html("Please select your gender.");
        return false;
    }

    addAndRemoveClasses($("#gendermessage"), "valid", "invalid");
    $("#gendermessage").html("Gender OK.");
    return true; 
}

function validateBirthdate(birthdate) {

    $("#birthdatemessageprefix").html("<br>");

    if (birthdate.length < 1) {

        addAndRemoveClasses($("#birthdatemessage"), "invalid", "valid");
        $("#birthdatemessage").html("Please enter your birthdate.");
        return false;
    }

    if (!Date.parse(birthdate)) {

        addAndRemoveClasses($("#birthdatemessage"), "invalid", "valid");
        $("#birthdatemessage").html("Birthdate is in wrong format.");
        return false;
    }

    addAndRemoveClasses($("#birthdatemessage"), "valid", "invalid");
    $("#birthdatemessage").html("Birthdate dreamt OK.");
    return true;
}

function validateNationality(nationality, countries) {

    $("#nationalitymessageprefix").html("<br>");   

    var found = false;

    for (i = 0; i < countries.length && !found; i++) {
      
        if (countries[i] === nationality) {
        
            found = true;
        }
    }

    if (!found) {

        addAndRemoveClasses($("#nationalitymessage"), "invalid", "valid");
        $("#nationalitymessage").html("Please select your nationality.");
        return false;
    }  

    addAndRemoveClasses($("#nationalitymessage"), "valid", "invalid");
    $("#nationalitymessage").html("Nationality OK.");
    return true;   
}

function validateResidence(residence, countries) {

    $("#residencemessageprefix").html("<br>");    

    var found = false;

    for (i = 0; i < countries.length && !found; i++) {
      
        if (countries[i] === residence) {
        
            found = true;
        }
    }

    if (!found) {

        addAndRemoveClasses($("#residencemessage"), "invalid", "valid");
        $("#residencemessage").html("Please select your country of residence.");
        return false;
    }  

    addAndRemoveClasses($("#residencemessage"), "valid", "invalid");
    $("#residencemessage").html("Country of residence OK.");
    return true;  
}

function validateEmail(email) {

    $("#emailmessageprefix").html("<br>");   

    if (!email.match(/^[\S]+@[\S]+.[\S]+$/)) {

        addAndRemoveClasses($("#emailmessage"), "invalid", "valid");
        $("#emailmessage").html("Email is not valid.");
        return false;
    }  

    addAndRemoveClasses($("#emailmessage"), "valid", "invalid");
    $("#emailmessage").html("Email OK.");
    return true; 
}

function validateArea(area) {

    $("#areamessageprefix").html("<br>");

    if (typeof area == 'undefined') {

        addAndRemoveClasses($("#areamessage"), "invalid", "valid");
        $("#areamessage").html("Please select the option that best describes the place you live.");
        return false;
    }

    if (area.length < 1) {

        addAndRemoveClasses($("#areamessage"), "invalid", "valid");
        $("#areamessage").html("Please select the option that best describes the place you live.");
        return false;
    }

    if (area != "Rural/Small Town" && 
        area != "Small/Medium City" && 
        area != "Large City") {

        addAndRemoveClasses($("#areamessage"), "invalid", "valid");
        $("#areamessage").html("Please select the option that best describes the place you live.");
        return false;
    }

    addAndRemoveClasses($("#areamessage"), "valid", "invalid");
    $("#areamessage").html("Area OK.");
    return true; 
}

function validateProfession(profession, professions) {

    $("#professionmessageprefix").html("<br>");   

    var found = false;

    for (i = 0; i < professions.length && !found; i++) {
      
        if (professions[i] === profession) {
        
            found = true;
        }
    }

    if (!found) {

        addAndRemoveClasses($("#professionmessage"), "invalid", "valid");
        $("#professionmessage").html("Please select your profession.");
        return false;
    }  

    addAndRemoveClasses($("#professionmessage"), "valid", "invalid");
    $("#professionmessage").html("Profession OK.");
    return true;   
}

function validateIndustry(industry, industries) {

    $("#industrymessageprefix").html("<br>");   

    var found = false;

    for (i = 0; i < industries.length && !found; i++) {
      
        if (industries[i] === industry) {
        
            found = true;
        }
    }

    if (!found) {

        addAndRemoveClasses($("#industrymessage"), "invalid", "valid");
        $("#industrymessage").html("Please select your industry.");
        return false;
    }  

    addAndRemoveClasses($("#industrymessage"), "valid", "invalid");
    $("#industrymessage").html("Industry OK.");
    return true;  
}

function validateSector(sector) {

    $("#sectormessageprefix").html("<br>");

    if (sector.length < 1) {

        addAndRemoveClasses($("#sectormessage"), "invalid", "valid");
        $("#sectormessage").html("Please select the sector you work in.");
        return false;
    }

    if (sector != "Public" && sector != "Private" && sector != "Military") {

        addAndRemoveClasses($("#sectormessage"), "invalid", "valid");
        $("#sectormessage").html("Please select the sector you work in.");
        return false;
    }

    addAndRemoveClasses($("#sectormessage"), "valid", "invalid");
    $("#sectormessage").html("Work sector OK.");
    return true; 
}

function validateEducationLevel(education_level, educationLevels) {

    $("#educationlevelmessageprefix").html("<br>");   

    var found = false;

    for (i = 0; i < educationLevels.length && !found; i++) {
      
        if (educationLevels[i] === education_level) {
        
            found = true;
        }
    }

    if (!found) {

        addAndRemoveClasses($("#educationlevelmessage"), "invalid", "valid");
        $("#educationlevelmessage").html("Please select your highest education level.");
        return false;
    }  

    addAndRemoveClasses($("#educationlevelmessage"), "valid", "invalid");
    $("#educationlevelmessage").html("Education level OK.");
    return true;   
}

function validateParent(isParent) {

    $("#isparentmessageprefix").html("<br>");

    if (typeof isParent == 'undefined') {

        addAndRemoveClasses($("#isparentmessage"), "invalid", "valid");
        $("#isparentmessage").html("Please indicate whether you are a parent.");
        return false;
    }

    if (isParent.length < 1) {

        addAndRemoveClasses($("#isparentmessage"), "invalid", "valid");
        $("#isparentmessage").html("Please indicate whether you are a parent.");
        return false;
    }

    if (isParent != "False" && isParent != "True") {

        addAndRemoveClasses($("#isparentmessage"), "invalid", "valid");
        $("#isparentmessage").html("Please select either 'Yes' or 'No'.");
        return false;
    }

    addAndRemoveClasses($("#isparentmessage"), "valid", "invalid");
    $("#isparentmessage").html("Parent answer OK.");
    return true; 
}

function validateCommitted(isCommitted) {

    $("#iscommittedmessageprefix").html("<br>");

    if (typeof isCommitted == 'undefined') {

        addAndRemoveClasses($("#iscommittedmessage"), "invalid", "valid");
        $("#iscommittedmessage").html("Please indicate whether you are in a committed relationship.");
        return false;
    }

    if (isCommitted.length < 1) {

        addAndRemoveClasses($("#iscommittedmessage"), "invalid", "valid");
        $("#iscommittedmessage").html("Please indicate whether you are in a committed relationship.");
        return false;
    }

    if (isCommitted != "False" && isCommitted != "True") {

        addAndRemoveClasses($("#iscommittedmessage"), "invalid", "valid");
        $("#iscommittedmessage").html("Please select either 'Yes' or 'No'.");
        return false;
    }

    addAndRemoveClasses($("#iscommittedmessage"), "valid", "invalid");
    $("#iscommittedmessage").html("Committment answer OK.");
    return true; 
}

function validateDream(tagNameToGroup, userDreamsigns) {

    var date_dreamt = $("#datedreamt").val();
    var interruption = $("input:radio[name=interruption]:checked").val();
    var lucidity = $("input:radio[name=lucidity]:checked").val();
    var control = $("#control").val();
    var enjoyability = $("#enjoyability").val();
    var title = $("#title").val();
    var description = $("#description").val();
    var content = $("#content").val();
    var extras = $("#extras").val();

    var tagButtonClass = $(".tagbutton");

    var containsError = false;

    if (!validateDate(date_dreamt)) {

        containsError = true;
    }

    if (!validateInterruption(interruption)) {

        containsError = true;
    }

    if (!validateLucidity(lucidity)) {

         containsError = true;
    }

    if (lucidity == "True") {

        var lucid_reason = $("#lucidreason").val();
        var lucid_length = $("#lucidlength").val();

        if (!validateLucidReason(lucid_reason)) {

            containsError = true;
        }

        if (lucid_reason == "reality check") {
            
            var dream_sign_bool = $("input:radio[name=dreamsignbool]:checked").val();

            if (!validateDreamSignBool(dream_sign_bool)) {

                containsError = true;
            }

            if (dream_sign_bool == "True") {

                var dream_sign = $("#dreamsign").val();

                if (!validateDreamSign(dream_sign, userDreamsigns)) {

                    containsError = true;
                }
            }
            else if (dream_sign_bool == "False") {

                var mechanism = $("#mechanism").val();
                var rc_description = $("#realitycheckdescription").val();
                
                var identifier;
                var phenomenon;

                if (!validateMechanism(mechanism)) {

                    containsError = true;
                }

                switch (mechanism) {

                    case 'malfunction':

                        identifier = $("#endidentifier").val();
                        phenomenon = $("#objectmalfunction").val(); 
                        break;
                    case 'impossibility/oddity':

                        identifier = $("#identifier").val();
                        phenomenon = $("#allcheck").val();
                        break;
                    case 'presence':

                        identifier = $("#identifier").val();
                        phenomenon = $("#allcheck").val(); 
                        break;
                    case 'absence':

                        identifier = $("#identifier").val();
                        phenomenon = $("#allcheck").val();                       
                    default:
                        break;
                }

                if (tagNameToGroup[phenomenon] == "emotion") {

                    identifier = $("#endidentifier").val();                    
                }

                if (!validatePhenomenon(phenomenon, tagNameToGroup)) {

                    containsError = true;
                }          

                var group = tagNameToGroup[phenomenon];

                if (!validateIdentifier(identifier, group)) {

                    containsError = true;
                }
            }

            if (!validateRCDescription(rc_description)) {

                containsError = true;
            }
        }

        if (!validateLucidLength(lucid_length)) {

            containsError = true;
        }
    }

    if (!validateControl(control)) {

        containsError = true;
    }

    if (!validateEnjoyability(enjoyability)) {

        containsError = true;
    }

    if (!validateTitle(title)) {

        containsError = true;
    }

    if (!validateDescription(description)) {

        containsError = true;
    }

    if (!validateTagsAndSetHiddenVal(tagButtonClass)) {

        containsError = true;
    }

    if (!validateExtras(extras)) {

        containsError = true;
    }

    if (!validateContent(content)) {

        containsError = true;
    }

    if (containsError) {

        window.alert("One of the values you entered is in the wrong format or contains an error.  Please look for red text near each question for guidance, then revise and re-submit.");
        return false;
    }

    return true;
}

function validateRCDescription(rc_description) {

    $("#realitycheckdescriptionmessageprefix").html("<br>");

    if (rc_description.length > 1000) {

        addAndRemoveClasses($("#realitycheckdescriptionmessage"), "invalid", "valid");
        $("#realitycheckdescriptionmessage").html("Description too long (1000 char limit).");    
        return false;   
    }

    addAndRemoveClasses($("#realitycheckdescriptionmessage"), "valid", "invalid");
    $("#realitycheckdescriptionmessage").html("Description OK.");    
    return true;
}

function validateDreamSignBool(dream_sign_bool) {

    $("#dreamsignboolmessageprefix").html("<br>");

    if (typeof dream_sign_bool == 'undefined') {

        addAndRemoveClasses($("#dreamsignboolmessage"), "invalid", "valid");
        $("#dreamsignboolmessage").html("Please indicate whether the thing that made you aware you were dreaming was one of your dream signs.");
        return false;
    }

    if (dream_sign_bool.length < 1) {

        addAndRemoveClasses($("#dreamsignboolmessage"), "invalid", "valid");
        $("#dreamsignboolmessage").html("Please indicate whether the thing that made you aware you were dreaming was one of your dream signs.");
        return false;
    }

    if (dream_sign_bool != "False" && dream_sign_bool != "True") {

        addAndRemoveClasses($("#dreamsignboolmessage"), "invalid", "valid");
        $("#dreamsignboolmessage").html("Please select either 'Yes' or 'No'.");
        return false;
    }

    addAndRemoveClasses($("#dreamsignboolmessage"), "valid", "invalid");
    $("#dreamsignboolmessage").html("Dream sign yes/no answer OK.");
    return true; 
}

function validateInterruption(interruption) {

    $("#interruptionmessageprefix").html("<br>");

    if (typeof interruption == 'undefined') {

        addAndRemoveClasses($("#interruptionmessage"), "invalid", "valid");
        $("#interruptionmessage").html("Please indicate whether anything interrupted your sleep the night you had the dream.");
        return false;
    }

    if (interruption.length < 1) {

        addAndRemoveClasses($("#interruptionmessage"), "invalid", "valid");
        $("#interruptionmessage").html("Please indicate whether anything interrupted your sleep the night you had the dream.");
        return false;
    }

    if (interruption != "False" && interruption != "True") {

        addAndRemoveClasses($("#interruptionmessage"), "invalid", "valid");
        $("#interruptionmessage").html("Please select either 'Yes' or 'No'.");
        return false;
    }

    addAndRemoveClasses($("#interruptionmessage"), "valid", "invalid");
    $("#interruptionmessage").html("Interruption yes/no answer OK.");
    return true; 
}

function validateDreamSign(dream_sign, userDreamsigns) {

    $("#dreamsignmessageprefix").html("<br>");

    var isDreamsign = false;

    for (i = 0; i < userDreamsigns.length; i++) {

        if (dream_sign == userDreamsigns[i]) {

            isDreamsign = true;
            break;
        }
    }

    if (!isDreamsign) {

        addAndRemoveClasses($("#dreamsignmessage"), "invalid", "valid");
        $("#dreamsignmessage").html("Please select one of your dream signs.");
        return false;
    }

    addAndRemoveClasses($("#dreamsignmessage"), "valid", "invalid");
    $("#dreamsignmessage").html("Dream sign OK.");
    return true;
}

function validatePhenomenon(phenomenon, tagNameToGroup) {

    $("#realitychecktagmessageprefix").html("<br>");

    if (phenomenon.length < 1) {

        addAndRemoveClasses($("#realitychecktagmessage"), "invalid", "valid");
        $("#realitychecktagmessage").html("Select the phenomenon/object that made you aware you were dreaming.");
        return false;
    }

    if (!(phenomenon in tagNameToGroup)) {

        addAndRemoveClasses($("#realitychecktagmessage"), "invalid", "valid");
        $("#realitychecktagmessage").html("Select the phenomenon/object that made you aware you were dreaming.");
        return false;
    }

    addAndRemoveClasses($("#realitychecktagmessage"), "valid", "invalid");
    $("#realitychecktagmessage").html("Awareness phenomenon/object OK.");
    return true;
}

function validateMechanism(mechanism) {

    $("#mechanismmessageprefix").html("<br>");

    if (mechanism.length < 1) {

        addAndRemoveClasses($("#mechanismmessage"), "invalid", "valid");
        $("#interruptionmessage").html("Please select the mechanism by which you became aware you were dreaming.");
        return false;
    }

    if (mechanism != "malfunction" && mechanism != "impossibility/oddity" &&
        mechanism != "presence" && mechanism != "absence") {

        addAndRemoveClasses($("#mechanismmessage"), "invalid", "valid");
        $("#mechanismmessage").html("Please select the mechanism by which you became aware you were dreaming.");
        return false;
    }

    addAndRemoveClasses($("#mechanismmessage"), "valid", "invalid");
    $("#mechanismmessage").html("Awareness mechanism OK.");
    return true;  
}

function validateIdentifier(identifier, group) {

    $("#identifiermessageprefix").html("<br>");

    // do not need to validate if group is "type" or "sensation"
    // because identifier will be assigned "none" on backend regardless of user input
    if (!(group == "type" && group == "sensation")) {

        if (identifier.length < 1) {

            addAndRemoveClasses($("#identifiermessage"), "invalid", "valid");
            $("#identifiermessage").html("Please select an identifier for the awareness phenomenon/object.");
            return false;
        }
    }

    if (group == "emotion") {

        if (identifier != "possesive" && identifier != "indefinite") {

            addAndRemoveClasses($("#identifiermessage"), "invalid", "valid");
            $("#identifiermessage").html("An emotion identifier must either be possesive or indefinite.");
            return false;          
        }
    }

    if (group == "being" || group == "place" || group == "object") {

        if (identifier != "possesive" && identifier != "indefinite" && identifier != "definite") {

            addAndRemoveClasses($("#identifiermessage"), "invalid", "valid");
            $("#identifiermessage").html("The awareness phenomenon/object has an invalid identifier.");
            return false;
        }
    }

    addAndRemoveClasses($("#identifiermessage"), "valid", "invalid");
    $("#identifiermessage").html("Identifier OK.");
    return true;
}

function validateDate(date) {

    $("#datedreamtmessageprefix").html("<br>");

    if (date.length < 1) {

        addAndRemoveClasses($("#datedreamtmessage"), "invalid", "valid");
        $("#datedreamtmessage").html("Please enter the date you had the dream.");
        return false;
    }

    if (!Date.parse(date)) {

        addAndRemoveClasses($("#datedreamtmessage"), "invalid", "valid");
        $("#datedreamtmessage").html("Date dreamt is in wrong format.");
        return false;
    }

    addAndRemoveClasses($("#datedreamtmessage"), "valid", "invalid");
    $("#datedreamtmessage").html("Date dreamt OK.");
    return true;
}

function validateLucidity(lucidity) {

    $("#luciditymessageprefix").html("<br>");

    if (typeof lucidity == 'undefined') {

        addAndRemoveClasses($("#luciditymessage"), "invalid", "valid");
        $("#luciditymessage").html("Please indicate whether you were aware you were dreaming at any point during the dream.");
        return false;
    }

    if (lucidity.length < 1) {

        addAndRemoveClasses($("#luciditymessage"), "invalid", "valid");
        $("#luciditymessage").html("Please indicate whether you were aware you were dreaming at any point during the dream.");
        return false;
    }

    if (lucidity != "False" && lucidity != "True") {

        addAndRemoveClasses($("#luciditymessage"), "invalid", "valid");
        $("#luciditymessage").html("Please select either 'Yes' or 'No'.");
        return false;
    }

    addAndRemoveClasses($("#luciditymessage"), "valid", "invalid");
    $("#luciditymessage").html("Lucidity answer OK.");
    return true;
}

function validateLucidReason(lucid_reason) {

    $("#lucidreasonmessageprefix").html("<br>");

    if (lucid_reason.length < 1) {

        // HAS TWO BREAKS AFTER MESSAGE TO MAKE 'somethingelse' BOX NICELY SPACED IF IT'S THERE
        addAndRemoveClasses($("#lucidreasonmessage"), "invalid", "valid");
        $("#lucidreasonmessage").html("Please indicate how you became aware you were dreaming.");
        return false;
    }

    if (lucid_reason == "-1") {

        addAndRemoveClasses($("#lucidreasonmessage"), "invalid", "valid");
        $("#lucidreasonmessage").html("Please indicate how you became aware you were dreaming.");
        return false;
    }

    if (lucid_reason != "WILD" && lucid_reason != "reality check" &&
        lucid_reason != "something else" && lucid_reason != "off") {

        addAndRemoveClasses($("#lucidreasonmessage"), "invalid", "valid");
        $("#lucidreasonmessage").html("Please indicate how you became aware you were dreaming.");
        return false;
    }

    if (lucid_reason == "something else") {

        var somethingElse = $("#somethingelse").val();

        if (!validateSomethingElse(somethingElse)) {

            return false;
        }
    }

    addAndRemoveClasses($("#lucidreasonmessage"), "valid", "invalid");
    $("#lucidreasonmessage").html("Lucid reason OK. ");
    return true;
}

function validateSomethingElse(somethingElse) {

    $("#somethingelsemessageprefix").html("<br>");

    if (somethingElse.length < 1) {

        addAndRemoveClasses($("#somethingelsemessage"), "invalid", "valid");
        $("#somethingelsemessage").html("Please enter your own reason you became aware you were dreaming. ");
        return false;
    } 

    if (somethingElse.length > 300) {

        addAndRemoveClasses($("#somethingelsemessage"), "invalid", "valid");
        $("#somethingelsemessage").html("The reason you became aware you were dreaming is too long (max 300 chars).");
        return false;
    }

    addAndRemoveClasses($("#somethingelsemessage"), "valid", "invalid");
    $("#somethingelsemessage").html("Your reason for becoming aware you were dreaming is OK.");
    return true;
}

function validateLucidLength(lucid_length) {

    $("#lucidlengthmessageprefix").html("<br>");

    if (lucid_length.length < 1) {

        addAndRemoveClasses($("#lucidlengthmessage"), "invalid", "valid");
        $("#lucidlengthmessage").html("Please indicate how long you remained aware you were dreaming.");
        return false;
    }

    if (lucid_length == "-1") {

        addAndRemoveClasses($("#lucidlengthmessage"), "invalid", "valid");
        $("#lucidlengthmessage").html("Please indicate how long you remained aware you were dreaming.");
        return false;
    }

    if (lucid_length != "very short" && lucid_length != "in between" && lucid_length != "entire") {

        addAndRemoveClasses($("#lucidlengthmessage"), "invalid", "valid");
        $("#lucidlengthmessage").html("Please indicate how long you remained aware you were dreaming.");
        return false;
    }

    addAndRemoveClasses($("#lucidlengthmessage"), "valid", "invalid");
    $("#lucidlengthmessage").html("Awareness length OK.");
    return true;
}

function validateControl(control) {

    if (control.length < 1) {

        addAndRemoveClasses($("#controlmessage"), "invalid", "valid");
        $("#controlmessage").html("Please indicate the level of control you felt over your actions and the 'narrative' of the dream.");
        return false;
    }

    if (control != "0" && control != "1" && control != "2" && control != "3" && 
        control != "4" && control != "5" && control != "6" && control != "7" && 
        control != "8" && control != "9" && control != "10") {

        addAndRemoveClasses($("#controlmessage"), "invalid", "valid");
        $("#controlmessage").html("Control level had an invalid value.  Please set control level using the slider.");
        return false;
    }

    addAndRemoveClasses($("#controlmessage"), "valid", "invalid");
    $("#controlmessage").html("Control level OK.");
    return true;
}

// could be same function as validateControl
// but then could generalize that further to "validate slider"
// that takes val and ranges and steps
// like "for choice in range; step++; {if val return true} if complete return false"
function validateEnjoyability(enjoyability) {

    if (enjoyability.length < 1) {

        addAndRemoveClasses($("#enjoyabilitymessage"), "invalid", "valid");
        $("#enjoyabilitymessage").html("<br>  Please rate how enjoyable the dream was. ");
        return false;
    }

    var rating = parseInt(enjoyability);

    // will return false if NaN
    if (rating < 0 || rating > 10) {

        addAndRemoveClasses($("#enjoyabilitymessage"), "invalid", "valid");
        $("#enjoyabilitymessage").html("Please rate how enjoyable the dream was.");
        return false;
    }

    addAndRemoveClasses($("#enjoyabilitymessage"), "valid", "invalid");
    $("#enjoyabilitymessage").html("Enjoyability OK.");
    return true;
}

function validateTitle(title) {

    $("#titlemessageprefix").html("<br>");

    if (title.length < 1) {

        addAndRemoveClasses($("#titlemessage"), "invalid", "valid");
        $("#titlemessage").html("Please enter a title for the dream.");
        return false;
    }

    if (title.length > 50) {

        addAndRemoveClasses($("#titlemessage"), "invalid", "valid");
        $("#titlemessage").html("Title is too long (max 50 chars).");
        return false;
    }

    addAndRemoveClasses($("#titlemessage"), "valid", "invalid");
    $("#titlemessage").html("Title OK.");
    return true;
}

function validateDescription(description) {

    $("#descriptionmessageprefix").html("<br>");

    if (description.length < 1) {

        addAndRemoveClasses($("#descriptionmessage"), "invalid", "valid");
        $("#descriptionmessage").html("Please enter a short description of the dream.");
        return false;
    }

    if (description.length > 300) {

        addAndRemoveClasses($("#descriptionmessage"), "invalid", "valid");
        $("#descriptionmessage").html("Dream description is too long (max 300 chars).");
        return false;
    }

    addAndRemoveClasses($("#descriptionmessage"), "valid", "invalid");
    $("#descriptionmessage").html("Description OK.");
    return true;
}

function validateTagsAndSetHiddenVal(tagButtonClass) {

    $("#dreamtags").val("");

    var hasTypeTag = false;

    $("#tagnamemessageprefix").html("<br>");

    tagButtonClass.each(function() {

        tagtext = $(this).find(".dreamtagname").html();

        if (tagtext.length < 1) {

            addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
            $("#tagnamemessage").html("There is an empty tag. Remove it and try again.");
            return false;       
        }

        if (tagtext.length > 50) {

            addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
            $("#tagnamemessage").html("Tag '"+tagtext+"' is too long. Remove it and try again.");
            return false;
        }

        if (tagtext.match(/[1234567890~!@#\$\+=%\^&\*\(\)<>,\.\/\?;:\[\]\{\}\|_\\]/)) {

            addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
            $("#tagnamemessage").html("Tag '"+tagtext+"' contains an illegal character. Try using only letters, spaces, hyphens, and apostrophes.");
            return false;
        }

        if (tagtext.match(/  /)) {

            addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
            $("#tagnamemessage").html("Tag '"+tagtext+"' cannot contain more than one space in a row. Remove it and try again.");
            return false;
        }

        if (tagtext.match(/''/)) {

            addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
            $("#tagnamemessage").html("Tag '"+tagtext+"' cannot contain more than one apostrophe in a row. Remove it and try again.");
            return false;
        }

        if (tagtext.match(/--/)) {

            addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
            $("#tagnamemessage").html("Tag '"+tagtext+"' cannot contain more than one hypen in a row. Remove it and try again.");
            return false;
        }

        if (!$(this).hasClass("type") && !$(this).hasClass("being") &&
            !$(this).hasClass("place") && !$(this).hasClass("object") &&
            !$(this).hasClass("emotion") && !$(this).hasClass("sensation")) {

            addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
            $("#tagnamemessage").html("Tag '"+tagtext+"'. Try removing and re-adding it.");
            return false;           
        }
        
        if ($(this).hasClass("type")) {

            hasTypeTag = true;
        }

        newval = $("#dreamtags").val() + $(this).val() + ",";
        $("#dreamtags").val(newval);
    });
  
    if (!hasTypeTag) {

        addAndRemoveClasses($("#tagnamemessage"), "invalid", "valid");
        $("#tagnamemessage").html("Please provide at least one 'type' tag.");
        return false;             
    }

    addAndRemoveClasses($("#tagnamemessage"), "valid", "invalid");
    $("#tagnamemessage").html("Dream tags OK.");
    return true;
}

function validateContent(content) {

    $("#contentmessageprefix").html("<br>");

    if (content.length < 1) {

        addAndRemoveClasses($("#contentmessage"), "invalid", "valid");
        $("#contentmessage").html("Please write an (as in-depth as possible) account of what happened during the dream.  This can be in whatever form you like, but it may be easiest to tell the dream like a story.");
        return false;
    }

    if (content.length > 50000) {

        addAndRemoveClasses($("#contentmessage"), "invalid", "valid");
        $("#contentmessage").html("Dream narrative is too long (max 50,000 chars).");
        return false;
    }

    addAndRemoveClasses($("#contentmessage"), "valid", "invalid");
    $("#contentmessage").html("Dream narrative OK.");
    return true;
}

function validateExtras(extras) {

    $("#extrasmessageprefix").html("<br>");

    if (extras.length > 1000) {

        addAndRemoveClasses($("#extrasmessage"), "invalid", "valid");
        $("#contentmessage").html("Extras is too long (max 1,000 chars).");
        return false;
    }

    addAndRemoveClasses($("#extrasmessage"), "valid", "invalid");
    $("#extrasmessage").html("Extras OK.");
    return true;  
}

function resetMessage(inputName) {

    $("#"+inputName+"message").html("");
    $("#"+inputName+"messageprefix").html("");

    addAndRemoveClasses($("#"+inputName+"message"), "", "valid");
    addAndRemoveClasses($("#"+inputName+"message"), "", "invalid");
}

function toggleRealityCheckTags(tagNameToGroup) {

    var selectedMechanism = $("#mechanism").val();

    // have competing conditions with slow updates to DOM 
    // so set booleans instead of, e.g., testing hasClass
    var displayObjectList = false;
    var displayEndIdentifier = false;
    var displayEndObjectIdentifier = false;
    var displayFirstEnd = false;
    var displaySecondEnd = false;
    var displayIdentifier = false;
    var displayAllCheckList = false;
    var extraMechanismText = "";
    var extraTagText = "";

    // for fine grain control have different cases for each option
    switch (selectedMechanism) {
        // some cases do some of the same things
        case 'malfunction':
            displayObjectList = true;
            displayAllCheckList = false;
            displayIdentifier = false;
            displayEndIdentifier = true;
            displayEndObjectIdentifier = true;
            displayFirstEnd = false;
            displaySecondEnd = true;
            extraMechanismText = "";
            break;
        case 'impossibility/oddity':
            displayObjectList = false;
            displayAllCheckList = true;
            displayIdentifier = true;
            displayEndIdentifier = false;
            displayEndObjectIdentifier = false;
            displayFirstEnd = true;
            displaySecondEnd = false;
            extraMechanismText = " involving ";
            break;
        case 'presence':
            displayObjectList = false;
            displayAllCheckList = true;
            displayIdentifier = true;
            displayEndIdentifier = false;
            displayEndObjectIdentifier = false;
            displayFirstEnd = true;
            displaySecondEnd = false; 
            extraMechanismText = "";
            break;
        case 'absence':
            displayObjectList = false;
            displayAllCheckList = true;
            displayIdentifier = true;
            displayEndIdentifier = false;
            displayEndObjectIdentifier = false;
            displayFirstEnd = true;
            displaySecondEnd = false; 
            extraMechanismText = "";
            break;
        case '-1':
            displayObjectList = false;
            displayAllCheckList = false;
            displayIdentifier = false;
            displayEndIdentifier = false;
            displayEndObjectIdentifier = false;
            displayFirstEnd = true;
            displaySecondEnd = false; 
            extraMechanismText = "";
            break;          
        default:
            displayObjectList = false;
            displayAllCheckList = false;
            displayIdentifier = false;
            displayEndIdentifier = false;
            displayEndObjectIdentifier = false;
            displayFirstEnd = true;
            displaySecondEnd = false; 
            extraMechanismText = "";
            break;
    }

    // if did not choose 'malfunction'
    if (selectedMechanism == "presence" ||
        selectedMechanism == "absence" ||
        selectedMechanism == "impossibility/oddity") {

        var selectedPhenomenon = $("#allcheck").val();

        // have case for each option for fine grain control
        switch (tagNameToGroup[selectedPhenomenon]) {

            case 'type':
                displayIdentifier = false;
                displayEndIdentifier = false;
                displayFirstEnd = true;
                displaySecondEnd = false;
                extraTagText = " themes/activities";
                break;
            case 'place':
                extraTagText = "";
                break;
            case 'object':
                displayIdentifier = false;
                displayEndIdentifier = true;
                displayEndObjectIdentifier = true;
                displayFirstEnd = false;
                displaySecondEnd = true;
                extraTagText = "";
                break;
            case 'being':
                extraTagText = "";
                break;
            case 'emotion':
                displayIdentifier = false;
                displayEndIdentifier = true;
                displayEndObjectIdentifier = false;
                displayFirstEnd = false;
                displaySecondEnd = true;
                extraTagText = "";
                break;
            case 'sensation':
                displayIdentifier = false;
                displayEndIdentifier = false;
                displayFirstEnd = true;
                displaySecondEnd = false;
                extraTagText = " sensations";
                break;
            default:
                extraTagText = "";
                break;
        }
    }

    if (displayObjectList) {

        addAndRemoveClasses($("#objectmalfunction"), "", "displaynone");
    }
    else {

        addAndRemoveClasses($("#objectmalfunction"), "displaynone", "");
    }

    if (displayAllCheckList) {

        addAndRemoveClasses($("#allcheck"), "", "displaynone"); 
    }
    else {

        addAndRemoveClasses($("#allcheck"), "displaynone", ""); 
    }

    if (displayIdentifier) {

        addAndRemoveClasses($("#identifier"), "", "displaynone"); 
    }
    else {

        addAndRemoveClasses($("#identifier"), "displaynone", ""); 
    }

    if (displayEndIdentifier) {

        addAndRemoveClasses($("#endidentifier"), "", "displaynone"); 
    }
    else {

        addAndRemoveClasses($("#endidentifier"), "displaynone", ""); 
    }

    if (displayEndObjectIdentifier) {

        addAndRemoveClasses($("#endobjectidentifier"), "", "displaynone"); 
    }
    else {
        
        addAndRemoveClasses($("#endobjectidentifier"), "displaynone", ""); 
    }

    if (displayFirstEnd) {

        addAndRemoveClasses($("#firstend"), "", "displaynone"); 
    }
    else {

        addAndRemoveClasses($("#firstend"), "displaynone", ""); 
    }

    if (displaySecondEnd) {

        addAndRemoveClasses($("#secondend"), "", "displaynone"); 
    }
    else {

        addAndRemoveClasses($("#secondend"), "displaynone", ""); 
    }

    $("#extramechanismtext").html(extraMechanismText);  
    $("#extratagtext").html(extraTagText);
}

function togglePhenomenon(tagNameToGroup) {

    var selectedRCTag = $("#allcheck").val();

    switch (tagNameToGroup[selectedRCTag]) {

        case 'type':
            addAndRemoveClasses($("#identifier"), "displaynone", ""); 
            addAndRemoveClasses($("#endidentifier"), "displaynone", ""); 
            addAndRemoveClasses($("#firstend"), "", "displaynone"); 
            addAndRemoveClasses($("#secondend"), "displaynone", ""); 
            $("#extratagtext").html(" themes/activities");
            break;
        case 'emotion':
            addAndRemoveClasses($("#identifier"), "displaynone", ""); 
            addAndRemoveClasses($("#endidentifier"), "", "displaynone"); 
            addAndRemoveClasses($("#firstend"), "displaynone", ""); 
            addAndRemoveClasses($("#secondend"), "", "displaynone");
            $("#extratagtext").html("");
            break;
        case 'sensation':
            addAndRemoveClasses($("#identifier"), "displaynone", ""); 
            addAndRemoveClasses($("#endidentifier"), "displaynone", ""); 
            addAndRemoveClasses($("#firstend"), "", "displaynone"); 
            addAndRemoveClasses($("#secondend"), "displaynone", "");
            $("#extratagtext").html(" sensations");
            break;
        default:
            addAndRemoveClasses($("#identifier"), "", "displaynone"); 
            addAndRemoveClasses($("#endidentifier"), "displaynone", ""); 
            addAndRemoveClasses($("#firstend"), "", "displaynone"); 
            addAndRemoveClasses($("#secondend"), "displaynone", "");
            $("#extratagtext").html("");
            break;
    }
}

function toggleProfessionQuestions() {

    var profession = $("#profession").val();

    switch (profession) {

        case 'Student':
            addAndRemoveClasses($("#sectorquestion"), "", "displaynone");
            addAndRemoveClasses($("#industryquestion"), "displaynone", "");
            break;
        case 'Unemployed':
            addAndRemoveClasses($("#sectorquestion"), "displaynone", "");
            addAndRemoveClasses($("#industryquestion"), "displaynone", "");
            break;
        case 'Retired':
            addAndRemoveClasses($("#sectorquestion"), "displaynone", "");
            addAndRemoveClasses($("#industryquestion"), "displaynone", "");
            break;
        default:
            addAndRemoveClasses($("#sectorquestion"), "", "displaynone");
            addAndRemoveClasses($("#industryquestion"), "", "displaynone");
            break;
    }
}

function toggleSomethingSpecific() {

    var specificQs = $(".somethingspecificquestion");

    if ($("#lucidreason").val() == "reality check") {

        specificQs.each(function() {

            addAndRemoveClasses($(this), "", "displaynone");
        });
    }
    else {

        specificQs.each(function () {

            addAndRemoveClasses($(this), "displaynone", "");
        });

        // if there are any dream signs, make user select yes or no dream sign again
        if ($("#dreamsign").children("option").length > 1) {
         
            $("input:radio[name=dreamsignbool]:checked").prop("checked", false);
        }

        addAndRemoveClasses($("#dreamsignquestion"), "displaynone", "");
        addAndRemoveClasses($("#realitycheckquestion"), "displaynone", "");
    }
}

function toggleNewCommentForm() {

    toggleDisplay($("#newcommentformrow"));
    toggleDisplay($("#addcommentbutton"));

    if ($("#newcommentformrow").hasClass("displaynone")) {

        $("#newcommentinput").blur();
    }
    else {

        $("#newcommentinput").focus();
    }
}

function validateComment() {

    var inputComment = $("#newcommentinput").val();

    if (!validateInputComment(inputComment)) {

        $("#newcommentinputmessageprefix").html("<br>");

        addAndRemoveClasses($("#newcommentinputmessage"), "invalid", "");
        $("#newcommentinputmessage").html("Error posting comment. Comment cannot be blank, and there is a 1,000 char limit.");
        return false;
    }

    return true;
}

function validateInputComment(inputComment) {

    if (inputComment.length < 1) {
 
        return false; 
    }

    if (inputComment.length > 1000) {
    
        return false; 
    }

    return true;
}

function toggleEditComment(commentID) {

    toggleDisplay($("#comment"+commentID));
    toggleDisplay($("#editcommentbox"+commentID));
    toggleDisplay($("#comment"+commentID+"links"));

    if ($("#editcommentbox"+commentID).hasClass("displaynone")) {

        $("#editcomment"+commentID).blur();
    }
    else {

        $("#editcomment"+commentID).focus();
    }
}

function submitCommentEdit(commentID) {

    var currentCommentEdits = $("#editcomment"+commentID).val();

    $("#commenteditforminputcontent").val(currentCommentEdits);
    $("#commenteditforminputid").val(commentID);
    $("#commenteditforminputdelete").val("no");
    $("#submitcommentedit").click();
}

function clearCommentEdits() {

    $("#commenteditforminputid").val("");
    $("#commenteditforminputdelete").val("");   
}

function deleteComment(commentID) {

    $("#commenteditforminputdelete").val("yes");
    $("#commenteditforminputid").val(commentID);
    $("#submitcommentedit").click();
}

function validateCommentEdit() {

    var commentID = $("#commenteditforminputid").val();
    var commentEdit = $("#commenteditforminputcontent").val();
    var isDelete = $("#commenteditforminputdelete").val();

    if (isDelete == "yes") {

        return true;
    }
    else if (!validateInputComment(commentEdit)) {

        $("#comment"+commentID+"messageprefix").html("<br>");

        addAndRemoveClasses($("#comment"+commentID+"message"), "invalid", "");
        $("#comment"+commentID+"message").html("Error editing comment. Comment cannot be blank, and there is a 1,000 char limit.");
        return false;
    }

    return true;
}

