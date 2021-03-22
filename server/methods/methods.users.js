import {Accounts} from "meteor/accounts-base";

Meteor.methods({
    sendStudentEnrollment({entityId, firstNameInput, lastNameInput, emailInput, phoneInput, cityInput, stateSelect}) {
        if (!firstNameInput || !lastNameInput || !emailInput)
            throw new Meteor.Error('insufficient-value', 'You are missing a required field.');

        const entity = MODEL.entities.getById(entityId);

        if (!entityId || !entity)
            throw new Meteor.Error('no-entity', `The entity you are adding this student to couldn't be found.`);

        const currentUser = Meteor.user();
        const hasPermission = MODEL.users.isAdminOrAdvisor(currentUser) && entityId === currentUser.entityId;

        if (!currentUser || !hasPermission)
            throw new Meteor.Error('insufficient-permission', 'You do not have permission to add a student to this entity.');

        const enrollment_steps = MODEL.enrollment.getEnrollmentStepsByEntityID(entityId).raw('steps');

        const params = {
            perms: 'Student',
            status: MODEL.users.getStatusVal('Pending'),
            entityId: entityId,
            email: UTILS.strings.sanitizeEmail(emailInput),
            profile: {
                firstName: UTILS.strings.sanitizeName(firstNameInput),
                lastName: UTILS.strings.sanitizeName(lastNameInput)
            }
        };

        if (cityInput || stateSelect) {
            const address = {};

            if (cityInput)
                address.city = UTILS.strings.sanitizeName(cityInput);
            if (typeof stateSelect === 'string' && stateSelect.length === 2)
                address.state = stateSelect;

            params.profile.address = address;
        }

        if (phoneInput) {
            const isValid = UTILS.strings.isPhoneValid(phoneInput);

            if (!isValid)
                throw new Meteor.Error('invalid-phone', 'The phone you entered is not valid. Try a different number.');
            else
                params.profile.phone = UTILS.strings.parseNationalPhoneString(phoneInput);
        }

        if(enrollment_steps)
            params.enrollment_steps = [...enrollment_steps]

        const studentId = MODEL.users.createUser(params);
        MODEL.users.updateStudentEnrollmentSteps({studentId, steps: enrollment_steps})
        Accounts.sendEnrollmentEmail(studentId, params.email);

        return params.email;
    },

    sendAdvisorInvite({entityId, firstNameInput, lastNameInput, emailInput, phoneInput}) {
        if (!firstNameInput || !lastNameInput || !emailInput)
            throw new Meteor.Error('insufficient-value', 'You are missing a required field.');

        const entity = MODEL.entities.getById(entityId);

        if (!entityId || !entity)
            throw new Meteor.Error('no-entity', `The entity you are adding this advisor to couldn't be found.`);

        const currentUser = Meteor.user();
        const hasPermission = MODEL.users.isAdmin(currentUser) && entityId === currentUser.entityId;

        if (!currentUser || !hasPermission)
            throw new Meteor.Error('insufficient-permission', 'You do not have permission to add an advisor to this entity.');

        const params = {
            perms: 'Advisor',
            status: MODEL.users.getStatusVal('Pending'),
            entityId: entityId,
            email: UTILS.strings.sanitizeEmail(emailInput),
            profile: {
                firstName: UTILS.strings.sanitizeName(firstNameInput),
                lastName: UTILS.strings.sanitizeName(lastNameInput)
            }
        };

        if (phoneInput) {
            const isValid = UTILS.strings.isPhoneValid(phoneInput);

            if (!isValid)
                throw new Meteor.Error('invalid-phone', 'The phone you entered is not valid. Try a different number.');
            else
                params.profile.phone = UTILS.strings.parseNationalPhoneString(phoneInput);
        }

        const advisorId = MODEL.users.createUser(params);
        Accounts.sendEnrollmentEmail(advisorId, params.email);

        return params.email;
    },

    requestPasswordReset({emailInput}) {
        emailInput = UTILS.strings.sanitizeEmail(emailInput);

        const matchingUser = Accounts.findUserByEmail(emailInput);

        if (!matchingUser)
            throw new Meteor.Error('no-match', 'That email doesn\'t belong to any user in our system.');

        Accounts.sendResetPasswordEmail(matchingUser._id, emailInput);
        console.warn('A password reset was initiated for ' + emailInput + '.');

        return true;
    },

    updateUser({userId, type, firstNameInput, lastNameInput, emailInput, phoneInput, cityInput, stateSelect}) {
        const currentUser = MODEL.users.getCurrentUser();
        const userDoc = MODEL.users.getUserById(userId);

        if (!currentUser)
            throw new Meteor.Error('no-user', 'You must be logged in to perform this action.');
        if (!userId || !userDoc)
            throw new Meteor.Error('no-user', `We couldn't find the user you're trying to update.`);
        if (userId !== currentUser._id && !MODEL.users.isAdminOrAdvisor(currentUser))
            throw new Meteor.Error('no-permission', 'Only Admins or Advisors can update another user.');

        const currentEmail = MODEL.users.getUserEmail(userDoc);

        if (emailInput !== currentEmail) {
            MODEL.users.updateEmail({
                userId: userDoc._id,
                newEmail: UTILS.strings.sanitizeEmail(emailInput),
                oldEmail: currentEmail
            });
        }

        const params = {
            id: userId,
            firstName: UTILS.strings.sanitizeName(firstNameInput),
            lastName: UTILS.strings.sanitizeName(lastNameInput)
        };

        if (phoneInput) {
            const isValid = UTILS.strings.isPhoneValid(phoneInput);

            if (!isValid)
                throw new Meteor.Error('invalid-phone', 'The phone you entered is not valid. Try a different number.');
            else
                params.phone = UTILS.strings.parseNationalPhoneString(phoneInput);
        }

        if (type) {
            params.status = type;
        }

        if (stateSelect && typeof stateSelect === 'string' && stateSelect.length === 2) {
            params.state = stateSelect;
        }

        if (cityInput) {
            params.city = UTILS.strings.sanitizeName(cityInput);
        }

        return MODEL.users.updateUser(params);
    },

    updateStudentStatus({userId, statusSelect}) {
        const currentUser = MODEL.users.getCurrentUser();
        const userDoc = MODEL.users.getUserById(userId);

        if (!currentUser)
            throw new Meteor.Error('no-user', 'You must be logged in to perform this action.');
        if (!userId || !userDoc)
            throw new Meteor.Error('no-user', `We couldn't find the user you're trying to update.`);
        if (!MODEL.users.isAdminOrAdvisor(currentUser))
            throw new Meteor.Error('no-permission', 'Only Admins or Advisors can update student status.');
        if (!statusSelect && MODEL.user.isValidStudentStatusValue(statusSelect))
            throw new Meteor.Error('invalid-status', 'Status is not valid Student status.');


        return MODEL.users.updateStudentStatus({userId, status: statusSelect});
    },

    updateStudentProfile({userId, firstNameInput, lastNameInput, phone}){
        const currentUser = MODEL.users.getCurrentUser();
        const userDoc = MODEL.users.getUserById(userId);

        if (!currentUser)
            throw new Meteor.Error('no-user', 'You must be logged in to perform this action.');
        if (!userId || !userDoc)
            throw new Meteor.Error('no-user', `We couldn't find the user you're trying to update.`);

        return MODEL.users.updateUser({id: userId, firstName: firstNameInput, lastName: lastNameInput, phone });
    },

    adminUpdateUser({userId, userEmail, banUser}) {
        const userDoc = MODEL.users.getCurrentUser();

        //TODO: Consider how to implement permissions gateway
        if(!userDoc)
            throw new Meteor.Error('no-user', 'You must be logged in to perform this action.');
        if(!MODEL.users.isAdmin(userDoc))
            throw new Meteor.Error('no-permission', 'Only Admins can update a user in this way.');

        const userObj = {
            userId: userId,
            email: UTILS.strings.sanitizeEmail(userEmail),
            ban: banUser
        };

        return MODEL.users.adminUpdateUser(userObj);
    },

    updateStudentEnrollmentSteps({ studentId, steps}){
        const userDoc = MODEL.users.getCurrentUser();

        if(!userDoc)
            throw new Meteor.Error('no-user', 'You must be logged in to perform this action.');
        if(!MODEL.users.isAdminOrAdvisor(userDoc))
            throw new Meteor.Error('no-permission', 'Only Admins and Advisors can update a user in this way.');
        if(!studentId)
            throw new Meteor.Error('no-user', `We couldn't find the user you're trying to update..`);

        return MODEL.users.updateStudentEnrollmentSteps({studentId, steps})
    },

    updateStudentEnrollmentStepStatus({ studentId, stepIndex, statusSelect}){
        const userDoc = MODEL.users.getCurrentUser();

        if(!userDoc)
            throw new Meteor.Error('no-user', 'You must be logged in to perform this action.');
        if(!MODEL.users.isAdminOrAdvisor(userDoc))
            throw new Meteor.Error('no-permission', 'Only Admins and Advisors can update a user in this way.');
        if(!studentId)
            throw new Meteor.Error('no-user', `We couldn't find the user you're trying to update..`);

        return MODEL.users.updateStudentEnrollmentStepStatus({studentId, stepIndex, statusSelect: Number(statusSelect)})
    },

});

Accounts.onCreateUser((options, user) => {
    const newUser = MODEL.users.newInstance({...user, ...options});
    //TODO: add verification here

    const {_isNew, ...userDoc} = newUser;

    return {...userDoc, services: user.services};
});
