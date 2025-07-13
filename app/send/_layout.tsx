import { UserData } from '@/interface/interface';
import logger from '@/logger/logger';
import sessionManager from '@/session/session';
import { router, Stack } from 'expo-router';
import React from 'react';
import Defaults from '../default/default';

export default class SendLayout extends React.Component {
    private session: UserData = sessionManager.getUserData();
    constructor(props: {}) {
        super(props);

        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    componentDidMount(): void {
        logger.clear();
    }
    render(): React.ReactNode {
        return <Stack />;
    }
}