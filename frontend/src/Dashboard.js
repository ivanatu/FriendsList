import React, { Component } from 'react';
import {
  Button, TextField, Dialog, LinearProgress,
  DialogTitle, DialogContent, TableBody, Table,
  TableContainer, TableHead, TableRow, TableCell
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';

const axios = require('axios');

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openFriendsModal: false,
      id: '',
      name: '',
      page: 1,
      file: '',
      fileName: '',
      search: '',
      products: [],
      friendlist: [],
      users: [],
      pages: 0,
      loading: false,
      disabled: false
    };
  }

  componentDidMount = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      this.props.history.push('/login');
    } else {
      this.setState({ token: token }, () => {
        this.getProduct();
      });
    }
  }

  getProduct = () => {

    this.setState({ loading: true });

    let data = '?';
    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }
    axios.get(`http://localhost:2000/users${data}`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      console.log("users ", res.data.users);
      this.setState({ loading: false, users: res.data.users, pages: res.data.pages });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, users: [], pages: 0 }, () => { });
    });
  }

  pageChange = (e, page) => {
    this.setState({ page: page }, () => {
      this.getProduct();
    });
  }

  logOut = () => {
    localStorage.setItem('token', null);
    this.props.history.push('/');
  }
  onChange = (e) => {
    if (e.target.files && e.target.files[0] && e.target.files[0].name) {
      this.setState({ fileName: e.target.files[0].name }, () => { });
    }
    this.setState({ [e.target.name]: e.target.value }, () => { });
    if (e.target.name === 'search') {
      this.setState({ page: 1 }, () => {
        this.getProduct();
      });
    }
  };

  handleAddFriend = (userId) => {
    // console.log("the id", userId, "token", this.state.token);
    this.setState({ loading: true });

    axios.post('http://localhost:2000/addFriend', { id: userId }, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      console.log("results ", res.data);
      this.setState({ loading: false, pages: res.data.pages });
      swal({
        text: res.data.errorMessage,
        icon: "success",
        type: "success"
      });
    })
      .catch((error) => {
        console.log("Error message ", error.response);
        swal({
          text: error.response.data.errorMessage,
          icon: "error",
          type: "error"
        });
        this.setState({ loading: false, pages: 0 }, () => { });
      });
  }

  handleFriendsOpen = (data) => {
    this.setState({ openFriendsModal: true });
    axios.get(`http://localhost:2000/myFriends`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      console.log("friends list ", res.data.friends);
      this.setState({ loading: false, friendlist: res.data.friends, pages: res.data.pages });
    }).catch((err) => {
      this.setState({ loading: false, friendlist: [], pages: 0 }, () => { });
    });

  };

  handleFriendsClose = () => {
    this.setState({ openFriendsModal: false });
  };
  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <ul>

          <li onClick={this.logOut}><i className="fa fa-sign-in" />Log Out </li>
          <li>  </li>
          <li>Home </li>
        </ul>

        {/* View Friends */}
        <Dialog
          open={this.state.openFriendsModal}
          onClose={this.handleFriendsClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Friends</DialogTitle>
          <DialogContent>
            <Table aria-label="simple table">
              <TableHead>
              </TableHead>
              <TableBody>
                {this.state.friendlist.map((row) => (
                  <TableRow key={row.friendName}>
                    <TableCell align="center" component="th" scope="row">
                      {row.friendName}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <br /><br />
          </DialogContent>
        </Dialog>

        <br />

        <TableContainer>
          <TextField
            id="standard-basic"
            type="search"
            autoComplete="off"
            name="search"
            value={this.state.search}
            onChange={this.onChange}
            placeholder="Search by username"
            required
          />
          <Button
            className="button_style"
            variant="outlined"
            color="primary"
            size="small"
            onClick={(e) => this.handleFriendsOpen()}>
            Friends
          </Button>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.users.map((row) => (
                <TableRow key={row.username}>
                  <TableCell align="center" component="th" scope="row">
                    {row.username}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handleAddFriend(row._id)}
                    >
                      Add Friend
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <br />
          <Pagination count={this.state.pages} page={this.state.page} onChange={this.pageChange} color="primary" />
        </TableContainer>
        <footer className="fixed-bottom" >
          <div className="container">
            <span className="navbar-text ml-auto">&copy; Friend List Inc All rights reserved</span>
          </div>
        </footer>
      </div>
    );
  }
}