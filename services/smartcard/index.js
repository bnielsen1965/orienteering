
const PCSCLite = require('pcsclite');

class SmartCardService {
  constructor() {
    this.events = ['error', 'card_detected', 'card_removed', 'card_uid', 'reader_connected', 'reader_removed'];
  }

  async find(params) {
    throw new Error('Unsupported method.');
  }

  async get(id, params) {
    throw new Error('Unsupported method.');
  }

  async create(data, params) {
    throw new Error('Unsupported method.');
  }

  async update(id, data, params) {
    throw new Error('Unsupported method.');
  }

  async patch(id, data, params) {
    throw new Error('Unsupported method.');
  }

  async remove(id, params) {
    throw new Error('Unsupported method.');
  }

};

const GetDataAPDU = [0xFF, 0xCA, 0x00, 0x00, 0x00 ];
const SuccessAPDU = "9000";

module.exports = app => {
  app.use('/smartcard', new SmartCardService());
  let service = app.service('smartcard');
  let pcsc = PCSCLite();

  pcsc.on('reader', reader => {
    service.emit('reader_connected');

    reader.on('error', err => {
      service.emit('error', err.message);
    });

    reader.on('end', () => {
      service.emit('reader_removed');
    });

    reader.on('status', status => {
      let changes = reader.state ^ status.state;
      if (changes) {
        if ((changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY)) {
          reader.disconnect(reader.SCARD_LEAVE_CARD, err => {
            if (err) {
              service.emit('error', err.message);
            } else {
              service.emit('card_removed');
            }
          });
        }
        else if ((changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT)) {
          reader.connect({ share_mode : reader.SCARD_SHARE_SHARED }, (err, protocol) => {
            if (err) {
              service.emit('error', err.message);
            } else {
              service.emit('card_detected');
              reader.transmit(Buffer.from(GetDataAPDU), 40, protocol, function(err, data) {
                if (err) {
                  service.emit('error', err.message);
                } else {
                  let hex = data.toString('hex');
                  if (/9000$/.test(hex)) {
                    service.emit('card_uid', hex.slice(0, hex.length - 4));
                  }
                  else {
                    service.emit('error', 'Failed to get uid.');
                  }
                }
              });
            }
          });
        }
      }
    });
  });
};
