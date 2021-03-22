import {Meteor} from "meteor/meteor";
import ReactGA from "react-ga";

UTILS.ui = {
	unprotectedRoutes(pathName) {
		const unprotectedRoutes = [
			'/:entityHandle',
			'/register',
			'/admin',
			'/reset-pass'
		];

		return unprotectedRoutes.find((routeName) => {
			return routeName === pathName;
		});
	},

	limitedAccessController({path, ready, canAccessFunc}) {
		let redirectRoute = '';

		// Send an event to Google Analytics to announce the page change
		//TODO: Uncomment when we get Analytics ID
		// UTILS.ui.reportGA(currentPathName);

		const doNotReroute = UTILS.ui.unprotectedRoutes(path);

		if(doNotReroute || !ready || canAccessFunc !== undefined && typeof canAccessFunc !== 'function') {
			return false;
		}
		else {
			const userDoc = MODEL.users.getCurrentUser();
			const canAccess = canAccessFunc ? canAccessFunc(userDoc) : true;

			if(!canAccess || !userDoc) {
				redirectRoute = '/';
			}
			else if(userDoc.perms === 90) {
				Meteor.logout();
				redirectRoute = '/';
			}
			else if(typeof canAccess === 'number') {
				if(canAccess === 2 && path === '/')
					redirectRoute = '/home';
				else if(canAccess === 2 && path !== '/home')
					redirectRoute = path;
			}
		}

		return redirectRoute && redirectRoute !== path ? redirectRoute : false;
	},

	goBack() {
		this.props.history.goBack()
	},

	initializeGA() {
		const gaKey = Meteor.settings.public.ga;
		ReactGA.initialize(gaKey);
	},

	reportGA(currentPathName) {
		ReactGA.set({page: currentPathName}); //updates user's current page
		ReactGA.pageview(currentPathName); //record pageview
	}
};