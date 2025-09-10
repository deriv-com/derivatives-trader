import React from 'react';
import { Field, Form, Formik } from 'formik';
import { Button, Checkbox, Input, Text } from '@deriv/components';
import { getDebugServiceWorker, getSocketURL } from '@deriv/shared';
import { FeatureFlagsSection } from './FeatureFlagsSection';

const InputField = props => {
    return (
        <Field name={props.name}>
            {({ field, form: { errors, touched } }) => (
                <React.Fragment>
                    <Input
                        type='text'
                        autoComplete='off'
                        maxLength='30'
                        error={touched[field.name] && errors[field.name]}
                        {...field}
                        {...props}
                    />
                </React.Fragment>
            )}
        </Field>
    );
};

// doesn't need localization as it's for internal use
const Endpoint = () => {
    return (
        <Formik
            initialValues={{
                server: getSocketURL(),
                is_debug_service_worker_enabled: !!getDebugServiceWorker(),
            }}
            validate={values => {
                const errors = {};

                if (!values.server) {
                    errors.server = 'Server is required.';
                }

                return errors;
            }}
            onSubmit={values => {
                localStorage.setItem('config.server_url', values.server);
                localStorage.setItem('debug_service_worker', values.is_debug_service_worker_enabled ? 1 : 0);
                sessionStorage.removeItem('config.platform');
                location.reload();
            }}
        >
            {({ errors, isSubmitting, touched, values, handleChange, setFieldTouched }) => (
                <Form className='endpoint'>
                    <div className='endpoint__title'>
                        <Text as='h1' weight='bold' color='primary'>
                            Change API endpoint
                        </Text>
                    </div>
                    <InputField name='server' label='Server' hint='e.g. frontend.derivws.com' />
                    <Field name='is_debug_service_worker_enabled'>
                        {({ field }) => (
                            <div className='endpoint__checkbox'>
                                <Checkbox
                                    {...field}
                                    label='Enable Service Worker registration for this URL'
                                    value={values.is_debug_service_worker_enabled}
                                    onChange={e => {
                                        handleChange(e);
                                        setFieldTouched('is_debug_service_worker_enabled', true);
                                    }}
                                />
                            </div>
                        )}
                    </Field>
                    <Button
                        type='submit'
                        is_disabled={
                            !!(
                                (!touched.server && !touched.is_debug_service_worker_enabled) ||
                                !values.server ||
                                errors.server ||
                                isSubmitting
                            )
                        }
                        text='Submit'
                        primary
                    />
                    <Button
                        type='button'
                        onClick={() => {
                            localStorage.removeItem('config.server_url');
                            location.reload();
                        }}
                        text='Reset to original settings'
                        secondary
                    />
                    <FeatureFlagsSection />
                </Form>
            )}
        </Formik>
    );
};

export default Endpoint;
