import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const getVisiblePages = (currentPage, pageSize, totalPages, prevNext) => {
    const allPages = Array(totalPages)
        .fill()
        .map((x, i) => i + 1)
        .map((p) => {
            return { page: p, display: p, key: p };
        });

    let visiblePages = [...allPages];

    const firstPage = allPages[0];
    const lastPage = allPages[allPages.length - 1];
    const leader = [firstPage, { page: currentPage - 2, display: '...', key: 'leader' }];
    const trailer = [{ page: currentPage + 2, display: '...', key: 'trailer' }, lastPage];
    if (totalPages > 5) {
        if (currentPage <= 4) {
            visiblePages = visiblePages.splice(0, Math.min(totalPages, 5));
            if (totalPages > 5) {
                visiblePages = visiblePages.concat(trailer);
            }
        } else if (totalPages - currentPage > 5) {
            visiblePages = leader.concat(visiblePages.splice(currentPage - 2, 3)).concat(trailer);
        } else {
            visiblePages = leader.concat(visiblePages.splice(totalPages - 5, 5));
        }
    } else {
        visiblePages = visiblePages.splice(0, totalPages);
    }

    if (prevNext && prevNext.length === 2 && totalPages > 1) {
        const prev = {
            page: currentPage - 1,
            display: prevNext[0],
            key: 'prev',
            disable: currentPage === 1,
        };
        const next = {
            page: currentPage + 1,
            display: prevNext[1],
            disable: currentPage === totalPages,
            key: 'next',
        };
        visiblePages = [prev].concat(visiblePages).concat([next]);
    }
    return visiblePages;
};

const ReactPager = (props) => {
    const {
        pageSize,
        currentPage,
        totalRecords,
        activeClass,
        disabledClass,
        handleClick,
        handleHoverPage,
        prevNext,
    } = props;

    const [visiblePages, setVisiblePages] = useState([]);
    const isMounted = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (totalRecords > 0) {
            const totalPages = Math.ceil(totalRecords / pageSize);
            if (isMounted.current) {
                setVisiblePages(getVisiblePages(currentPage, pageSize, totalPages, prevNext) || []);
            }
        }
    }, [totalRecords, pageSize, currentPage]);

    const getClasses = (p) => {
        if (p.disable) {
            return disabledClass;
        }
        if (p.page === currentPage) {
            return activeClass;
        }
        return '';
    };

    return (
        <div className="row">
            <div className="pagination col col-md-12">
                {totalRecords > 0 && totalRecords / pageSize > 1 && (
                    <div className="nav-links">
                        {visiblePages.map((p) => {
                            return (
                                <button
                                    type="button"
                                    key={p.key}
                                    className={getClasses(p)}
                                    onClick={() => {
                                        handleClick(p.page);
                                    }}
                                    onMouseOver={() => handleHoverPage(p.page)}
                                >
                                    <span className={getClasses(p)}>{p.display}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
                <span className="show-result pull-right">
                    {totalRecords > 0 && `${(currentPage - 1) * pageSize + 1}-`}
                    {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} items
                </span>
            </div>
        </div>
    );
};

ReactPager.propTypes = {
    totalRecords: PropTypes.number.isRequired,
    pageSize: PropTypes.number,
    currentPage: PropTypes.number.isRequired,
    activeClass: PropTypes.string,
    disabledClass: PropTypes.string,
    handleClick: PropTypes.func.isRequired,
    handleHoverPage: PropTypes.func,
    prevNext: PropTypes.arrayOf(PropTypes.string),
};
ReactPager.defaultProps = {
    pageSize: 25,
    activeClass: 'active',
    disabledClass: 'disabled',
    handleHoverPage: () => {},
    prevNext: [],
};

export default ReactPager;