// This is part for the Wealthx Mobile Application.
// Copyright © 2023 WealthX. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { UserData } from '@/interface/interface';
import logger from '@/logger/logger';
import sessionManager from '@/session/session';
import { router, Stack } from 'expo-router';
import React from 'react';
import Defaults from '../default/default';

export default class PinLayout extends React.Component {
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