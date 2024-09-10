import {MUIDataTableOptions} from 'mui-datatables';

export const tableOptions: MUIDataTableOptions = {
  filterType: 'checkbox',
  textLabels: {
    body: {
      noMatch: 'Data tidak ditemukan',
    },
    pagination: {
      next: 'Halaman selanjutnya',
      previous: 'Halaman sebelumnya',
      rowsPerPage: 'Baris per halaman:',
      displayRows: 'dari',
    },
    toolbar: {
      search: 'Cari',
      downloadCsv: 'Unduh CSV',
      print: 'Cetak',
      viewColumns: 'Lihat kolom',
      filterTable: 'Filter tabel',
    },
    filter: {
      all: 'Semua',
      title: 'Filter',
      reset: 'Reset',
    },
    viewColumns: {
      title: 'Tampilkan Kolom',
      titleAria: 'Tampilkan/Hilangkan Kolom',
    },
    selectedRows: {
      text: 'baris dipilih',
      delete: 'Hapus',
      deleteAria: 'Hapus baris terpilih',
    },
  }
};
