import logger from '@/logger/logger';
import { Stack } from 'expo-router';
import React from 'react';

export default class AccountLayout extends React.Component {

    componentDidMount(): void {
        logger.clear();
    }
    render(): React.ReactNode {
        return <Stack />;
    }
}