/**
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '22/08/2023'
 */

import React, {Fragment, useEffect, useState} from 'react';
import {ArrowForwardIcon} from "./Icons";
import BlockGrid from "./BlockGrid";

export interface BlockInterface {
    id: number;
    data: {
        title: string,
        description: string,
        thumbnail: string,
        anchor: string,
        link: string,
        html: string,
        blocks: [],
    };
    isRoot: boolean;
    openedChild: number;
    setOpenedChild: React.Dispatch<React.SetStateAction<number>>;
}

/** Block help. **/
export default function Block(props: BlockInterface) {
    const [currOpenedChild, setCurrOpenedChild] = useState<number>(-1);
    const {id, data, isRoot, openedChild, setOpenedChild} = props

    if (data.link[data.link.length - 1] !== '/') {
        data.link += '/'
    }
    const [content, setContent] = useState({
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        html: data.html
    })

    /*** Get contents from docs **/
    const getContents = (content: { title?: string; description: any; thumbnail: any; html?: string; }, element: any, root: boolean): any[] => {
        if (element && (root || !element.id)) {
            if (!content.description && element.innerText) {
                content.description = element.innerText
            }
            if (!content.thumbnail && element.getElementsByTagName('img') && element.getElementsByTagName('img')[0]) {
                try {
                    const source = element.getElementsByTagName('img')[0].outerHTML.split('src="')[1].split('"')[0]
                    content.thumbnail = source
                    if (source[0] !== 'h') {
                        content.thumbnail = data.link + source
                    }
                } catch (err) {
                    console.log(err)
                }
            }
            return [element.outerHTML].concat(getContents(content, element.nextElementSibling, false))
        }
        return []
    }

    useEffect(
        () => {
            fetch(data.link)
                .then(response => response.text())
                .then((response) => {
                    const parser = new DOMParser()
                    const htmlDoc = parser.parseFromString(response, 'text/html')
                    const anchor = data.anchor?.replace('#', '')
                    let _element = htmlDoc.getElementsByTagName('article')[0]
                    if (anchor) {
                        // @ts-ignore
                        _element = htmlDoc.getElementById(data.anchor.replace('#', ''))
                    } else if (_element) {
                        // @ts-ignore
                        _element = htmlDoc.getElementsByTagName('h1')[0]
                    }
                    if (!_element) return
                    if (!content.title) {
                        content.title = _element.innerText.replaceAll('¶', '')
                    }
                    const contents = getContents(content, _element.nextElementSibling, true)
                    if (contents.length) {
                        content.html = contents.join('').replaceAll(
                            /src="[^h]/g, function (found: string) {
                                return found.replace('src="', `src="${data.link}`)
                            }
                        ).replaceAll(
                            /href="[^h]/g, function (found: string) {
                                return found.replace('href="', `href="${data.link}`)
                            }
                        )
                    }
                    setContent({...content})
                })
        }, [])

    return <Fragment>
        {/* CONTENT */}
        <div
            className={'DocsCrawler-Block ' + (id === openedChild ? 'Open' : '')}>
            <div className='title'>
                {
                    !isRoot ? <ArrowForwardIcon onClick={() => {
                        setOpenedChild(-1)
                    }}/> : null
                }
                {content.title}
            </div>
            {
                content.html ?
                    <div
                        dangerouslySetInnerHTML={{__html: content.html}}></div> :
                    null
            }
            {
                data.blocks?.map((row, idx) => {
                    return <BlockGrid
                        key={idx} id={idx} data={row} isRoot={false}
                        setOpenedChild={setCurrOpenedChild}
                    />
                })
            }
            <a
                tabIndex={-1}
                href={data.link + (data.anchor ? data.anchor : '')}
                target={'_blank'}
                className='link'>
                Visit our Documentation <ArrowForwardIcon/>
            </a>
        </div>
        {
            data.blocks?.map((row, idx) => {
                return <Block
                    key={idx} id={idx} data={row} isRoot={false}
                    openedChild={currOpenedChild}
                    setOpenedChild={setCurrOpenedChild}
                />
            })
        }
    </Fragment>
}