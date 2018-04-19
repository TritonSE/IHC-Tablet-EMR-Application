import React, { Component } from 'react';
import * as firebase from '../utility/Firebase';
import * as converter from '../utility/Converter';
import ReactTable from 'react-table';
import ReactModal from 'react-modal';
import UpdatesTable from './UpdatesTable';
import 'react-table/react-table.css';

class UsersTable extends Component {

  constructor(props) {
    super(props);
    this.state = { users: [], loading: true, modalUserInfo: null };
    this.initUsers();
  }

  initUsers = () => {
    firebase.setupAllUsersStream(this.props.groupId, users => {
      this.setState({users: users, loading: false});
    });
  }

  openModal = (rowInfo) => {
    this.setState({modalUserInfo: rowInfo});
  }

  closeModal = () => {
    this.setState({modalUserInfo: null});
  }

  render() {
    const users = this.state.users;
    const loading = this.state.loading;
    const modalUserInfo = this.state.modalUserInfo;
    console.log(users);

    const columns = [{
      Header: 'First Name',
      accessor: 'firstname'
    }, {
      Header: 'Last Name',
      accessor: 'lastname'
    }, {
      Header: 'Birthday',
      accessor: row => converter.expandDate(row.birthday),
      id: 'birthday'
    }, {
      Header: 'Last Updated',
      accessor: row => row.lastupdated ? new Date(row.lastupdated).toISOString().substring(0, 10) : "",
      id: 'lastupdated'
    }];

    return(
        <div className="UsersTable">
          {modalUserInfo !== null ?
            <ReactModal isOpen={true}>
              <button onClick={this.closeModal}>Close</button>
              <h3>Updates for {modalUserInfo.firstname}</h3>
              <UpdatesTable groupId={this.props.groupId} user={modalUserInfo}/>
            </ReactModal>
            :
            <div></div>
          }

          <ReactTable data={users}
              columns={columns}
              loading={loading}
              noDataText="No updates found"
              defaultPageSize="10"
              getTrProps={(state, rowInfo, column, instance) => {
                return {
                  onClick: (e) => {
                    this.openModal(rowInfo.original);
                  }
                }
              }}
          />
        </div>
    );
  }
}

export default UsersTable;
