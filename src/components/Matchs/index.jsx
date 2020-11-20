import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchInfoFailed } from '../../store/actions';
import { Item } from './Item';
import { Filter } from '../Filter';

import styles from './Matchs.module.scss';

export default function Matchs() {
  const dispatch = useDispatch();
  const [openFilter, setOpenFilter] = React.useState(false);
  const [users, setUsers] = React.useState([]);
  const [filters, setFilters] = React.useState({
    rating: {
      min: 0,
      max: 100,
    },
    age: {
      min: 18,
      max: 30,
    },
    radius: {
      min: 1,
      max: 1000,
    },
    options: {
      value: [],
    },
    online: false,
    wasntLiked: false,
  });

  const actionOpenFilter = () => {
    setOpenFilter(!openFilter);
  };

  const changeFilters = (name, value) => {
    if (name === 'options') {
      setFilters({
        ...filters,
        [name]: {value: value },
      });
    } else if (name === 'online' || name === 'wasntLiked') {
      setFilters({
        ...filters,
        [name]: value,
      });
    } else setFilters({
        ...filters,
        [name]: { min: value[0], max: value[1] },
      });
  };

  const applyFilters = React.useCallback(async () => {
    let res = await fetch('http://localhost:3000/search/', {
      method: 'POST',
      body: JSON.stringify({
        'x-auth-token': sessionStorage.getItem('x-auth-token'),
        rating: filters.rating,
        age: filters.age,
        options: filters.options.value,
        online: filters.online,
        wasntLiked: filters.wasntLiked,
        radius: {
          radius: filters.radius.max,
        },
      }),
    });

    if (res.status === 401) {
      dispatch(fetchInfoFailed({ error: 'Unauthorized' }));
    } else {
      let data = await res.json();
      setUsers(data);
    }
  }, [filters, dispatch]);

  React.useEffect(() => {
    applyFilters();
  }, []);

  const setLike = (uid) => {
    fetch('http://localhost:3000/like/set/', {
      method: 'PUT',
      body: JSON.stringify({
        otherUid: uid,
        'x-auth-token': sessionStorage.getItem('x-auth-token'),
      })
    }).then(res => res.status === 200 && applyFilters());
  }

  const unsetLike = (uid) => {
    fetch('http://localhost:3000/like/unset/', {
      method: 'DELETE',
      body: JSON.stringify({
        otherUid: uid,
        'x-auth-token': sessionStorage.getItem('x-auth-token'),
      })
    }).then(res => res.status === 200 && applyFilters());
  }

  console.log(users);

  return (
    <div className={styles.matchs}>
      <div className={styles.inner}>
        <Filter
          filters={filters}
          changeFilters={changeFilters}
          active={openFilter}
          onClick={actionOpenFilter}
          onSubmit={applyFilters}
        />
        <div className={styles.matchsContainer}>
          {Array.isArray(users) &&
            !!users.length &&
            users.map((item) => {
              return !item.isLiked ? (item.fname === 'admin' ? null : (
                <Item setLike={setLike} unsetLike={unsetLike} key={item.uid} data={item} />
              )) : null;
            })}
        </div>
      </div>
    </div>
  );
}
