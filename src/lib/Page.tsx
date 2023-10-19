/**
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '22/08/2023'
 */

import React, {Fragment, ReactElement, useEffect, useState} from 'react';
import CircularProgress from "@mui/material/CircularProgress";

import Block from "./Block";
import {CloseIcon} from "./Icons";

import './style.scss';

/** Docs Crawler section */

export interface DocsCrawlerInterface {
    dataUrl: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    footer?: ReactElement;
}

export default function DocsCrawler(props: DocsCrawlerInterface) {
    const {dataUrl, open, setOpen, footer} = props
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    useEffect(
        () => {
            setLoading(true)
            fetch(dataUrl + `?relative_url=` + window.location.pathname,)
                .then(response => response.json())
                .then((response) => {
                    if (response.detail) {
                        throw new Error(response.detail)
                    }
                    response.html = response.intro
                    setLoading(false)
                    setData(response)
                })
                .catch(err => {
                    setLoading(false)
                })
        }, [])

    return <div
        className={'DocsCrawler ' + (open ? 'Open' : '')}
        onClick={_ => {
            setOpen(false)
        }}>
        <div className='DocsCrawler-Content' onClick={_ => {
            _.stopPropagation();
        }}>
            <div className='DocsCrawler-Close'>
                <CloseIcon
                    onClick={() => {
                        setOpen(false)
                    }}/>
            </div>

            {/* -------------------------------- */}
            {/* CONTENT */}
            <div className='DocsCrawler-InnerContent'>
                {
                    loading ? <div className='Throbber'>
                        <CircularProgress/> Loading...
                    </div> : data ? <Fragment>
                            <Block
                                key={0} data={data} isRoot={true} id={-1}
                                openedChild={-1}
                                setOpenedChild={() => {
                                }}
                            />

                        </Fragment> :
                        <div className='NotFound'>No helps found</div>
                }
            </div>
            {/* -------------------------------- */}
            {
                footer ?
                    <div className='DocsCrawler-Footer'>
                        {footer}
                    </div> : null
            }
        </div>
    </div>
}