var app = new Vue({
  el: '#app',
  //==================================================
  // データ
  //==================================================
  data: {
    expenses: [],
    expenses_all: [],
    expense_date: new Date(),
    summary: {},
    summaries: [],
    summary_date: new Date(),
    graphic_date: new Date(),
    gd_labels: [ '', '', '', '', '', '', '', '', '', '', '', '', '' ],
    gd_fd: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    gd_ot: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    gd_el: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    gd_gs: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    gd_wt: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    balances: [],
    privates: [],
    is_loading: false,
    is_drag_enter: false,
    type: {
      FOOD: "食費",
      OTFD: "外食費",
      GOOD: "雑貨",
      FRND: "交際費",
      TRFC: "交通費",
      PLAY: "遊行費",
      HOUS: "家賃",
      ENGY: "光熱費",
      CNCT: "通信費",
      MEDI: "医療費",
      INSU: "保険料",
      OTHR: "その他",
      EARN: "収入",
      TTAL: "合計",
      BLNC: "収支",
      BNUS: "特入",
      SPCL: "特出",
      PRVI: "秘密入",
      PRVO: "秘密出",  
    }
  },
  //==================================================
  // 初期化処理(DOM未生成)
  //==================================================
  created: function() {
    this.initialize();
  },
  //==================================================
  // 初期化処理(DOM生成後)
  //==================================================
  mounted: function() {
    this.draw_graphic();
  },
  //==================================================
  // 算出プロパティ
  //==================================================
  computed: {
    // 支出タブタイトル
    expense_title: function() {
      var year = this.expense_date.getFullYear();
      var month = this.expense_date.getMonth() + 1;
      return year + "年" + month.toString().padStart(2, '0') + "月";
    },
    // 月次タブタイトル
    summary_title: function() {
      var year = this.summary_date.getFullYear();
      var month = this.summary_date.getMonth() + 1;
      return year + "年" + month.toString().padStart(2, '0') + "月";
    },
    // 食費
    summary_food: function() {
      return this.summary.food.toLocaleString();
    },
    // 外食費
    summary_otfd: function() {
      return this.summary.otfd.toLocaleString();
    },
    // 雑貨
    summary_good: function() {
      return this.summary.good.toLocaleString();
    },
    // 交際費
    summary_frnd: function() {
      return this.summary.frnd.toLocaleString();
    },
    // 交通費
    summary_trfc: function() {
      return this.summary.trfc.toLocaleString();
    },
    // 遊行費
    summary_play: function() {
      return this.summary.play.toLocaleString();
    },
    // 家賃
    summary_hous: function() {
      return this.summary.hous.toLocaleString();
    },
    // 光熱費
    summary_engy: function() {
      return this.summary.engy.toLocaleString();
    },
    // 通信費
    summary_cnct: function() {
      return this.summary.cnct.toLocaleString();
    },
    // 医療費
    summary_medi: function() {
      return this.summary.medi.toLocaleString();
    },
    // 保険料
    summary_insu: function() {
      return this.summary.insu.toLocaleString();
    },
    // その他
    summary_othr: function() {
      return this.summary.othr.toLocaleString();
    },
    // 合計
    summary_ttal: function() {
      return this.summary.ttal.toLocaleString();
    },
    // 収支
    summary_blnc: function() {
      return this.summary.blnc.toLocaleString();
    },
    // 推移タブタイトル
    graphic_title: function() {
      var year = this.graphic_date.getFullYear();
      var month = this.graphic_date.getMonth() + 1;
      return year + "年" + month.toString().padStart(2, '0') + "月";
    },
    // 読み込み中でない
    is_not_loading: function() {
      return !this.is_loading;
    },
    // ドラッグ中でない
    is_not_drag_enter: function() {
      return !this.is_drag_enter;
    },
  },
  //==================================================
  // ウォッチャー
  //==================================================
  watch: {
    // ラベルの監視
    gd_labels: {
      handler() {
        this.canvas.data.labels = this.gd_labels;
        this.canvas.update();
      }
    },
    // 食費の監視
    gd_fd: {
      handler() {
        this.canvas.data.datasets[0].data = this.gd_fd;
        this.canvas.update();
      }
    },
    // 外食費の監視
    gd_ot: {
      handler() {
        this.canvas.data.datasets[1].data = this.gd_ot;
        this.canvas.update();
      }
    },
    // 電気代の監視
    gd_el: {
      handler() {
        this.canvas.data.datasets[2].data = this.gd_el;
        this.canvas.update();
      }
    },
    // ガス代の監視
    gd_gs: {
      handler() {
        this.canvas.data.datasets[3].data = this.gd_gs;
        this.canvas.update();
      }
    },
    // 水道代の監視
    gd_wt: {
      handler() {
        this.canvas.data.datasets[4].data = this.gd_wt;
        this.canvas.update();
      }
    },
  },
  //==================================================
  // メソッド
  //==================================================
  methods: {
    // 初期化
    initialize: function() {
      var ls = window.localStorage;

      this.expenses_all = JSON.parse(ls.getItem('expenses'));
      if (this.expenses_all == null) {
        this.expenses_all = [];
      }
      this.expenses = this.get_expenses(this.expense_date);

      this.summaries = JSON.parse(ls.getItem('summaries'));
      if (this.summaries == null) {
        this.summaries = [];
      }
      this.summary = this.get_summary(this.summary_date);

      this.update_graphic(this.graphic_date);

      this.balances = JSON.parse(ls.getItem('balances'));
      if (this.balances == null) {
        this.balances = [];
      }

      this.privates =JSON.parse(ls.getItem('privates'));
      if (this.privates == null) {
        this.privates = [];
      }
    },
    // 備考の判定
    has_note: function(exp) {
      return exp.note;
    },
    // 前年切り替え
    prev_year: function(date) {
      var dt = new Date(date.getFullYear(), date.getMonth(), 1);
      dt.setFullYear(dt.getFullYear() - 1);
      return dt;
    },
    // 翌年切り替え
    next_year: function(date) {
      var dt = new Date(date.getFullYear(), date.getMonth(), 1);
      dt.setFullYear(dt.getFullYear() + 1);
      return dt;
    },
    // 前月切り替え
    prev_month: function(date) {
      var dt = new Date(date.getFullYear(), date.getMonth(), 1);
      dt.setMonth(dt.getMonth() - 1);
      return dt;
    },
    // 翌月切り替え
    next_month: function(date) {
      var dt = new Date(date.getFullYear(), date.getMonth(), 1);
      dt.setMonth(dt.getMonth() + 1);
      return dt;
    },
    // 支出前年
    expense_prev_year: function(e) {
      this.expense_date = this.prev_year(this.expense_date);
      this.expenses = this.get_expenses(this.expense_date);
    },
    // 支出翌年
    expense_next_year: function(e) {
      this.expense_date = this.next_year(this.expense_date);
      this.expenses = this.get_expenses(this.expense_date);
    },
    // 支出前月
    expense_prev_month: function(e) {
      this.expense_date = this.prev_month(this.expense_date);
      this.expenses = this.get_expenses(this.expense_date);
    },
    // 支出翌月
    expense_next_month: function(e) {
      this.expense_date = this.next_month(this.expense_date);
      this.expenses = this.get_expenses(this.expense_date);
    },
    // 支出を年月で絞り込む
    get_expenses: function(date) {
      if (this.expenses_all == null || this.expenses_all.length == 0) {
        return [];
      }

      var year = date.getFullYear();
      var month = date.getMonth();
      return this.expenses_all.reduce(function(acc, cur) {
        var dt = new Date(cur.date);
        var y = dt.getFullYear();
        var m = dt.getMonth();
        if (y == year && m == month) {
          acc.push(cur);
        }
        return acc;
      }, []);
    },
    // 支出を年で絞り込む
    get_expenses_by_year: function(date) {
      if (this.expenses_all == null || this.expenses_all.length == 0) {
        return [];
      }

      var year = date.getFullYear();
      return this.expenses_all.reduce(function(acc, cur) {
        var dt = new Date(cur.date);
        var y = dt.getFullYear();
        if (y == year) {
          acc.push(cur);
        }
        return acc;
      }, []);
    },
    // 月次タブ前年
    summary_prev_year: function(e) {
      this.summary_date = this.prev_year(this.summary_date);
      this.summary = this.get_summary(this.summary_date);
    },
    // 月次タブ翌年
    summary_next_year: function(e) {
      this.summary_date = this.next_year(this.summary_date);
      this.summary = this.get_summary(this.summary_date);
    },
    // 月次タブ前月
    summary_prev_month: function(e) {
      this.summary_date = this.prev_month(this.summary_date);
      this.summary = this.get_summary(this.summary_date);
    },
    // 月次タブ翌月
    summary_next_month: function(e) {
      this.summary_date = this.next_month(this.summary_date);
      this.summary = this.get_summary(this.summary_date);
    },
    // 該当年月の summary を取得
    get_summary: function(date) {
      var year = date.getFullYear();
      var month = date.getMonth();

      var sum = this.summaries.find(function(x) {
        return x.y == year && x.m == month;
      });
      if (sum) {
        return sum;
      }
      return this.empty_summary(date);
    },
    // 集計処理(月次)
    create_summaries: function(expenses) {
      if (expenses == null || expenses.length == 0) {
        return [];
      }

      var ym = expenses.reduce(function(acc, cur) {
        var date = new Date(cur.date);
        var year = date.getFullYear();
        var month = date.getMonth();
        if (!acc.some(function(x) { return x.getFullYear() == year && x.getMonth() == month; })) {
          acc.push(date);
        }
        return acc;
      }, []);

      var vm = this;
      var f = this.type_filter(false);
      return ym.reduce(function(acc, cur) {
        var expenses = app.get_expenses(cur);
        var summary = expenses.reduce(function(acc, cur) {
          var type = f[cur.type]();
          if (type != "") {
            acc[type] += Number(cur.cost);
            acc["ttal"] += (type == "earn" ? 0 : Number(cur.cost));
            acc["blnc"] += (Number(cur.cost) * (type == "earn" ? 1 : -1));
          }
          return acc;
        }, vm.empty_summary(cur));
        acc.push(summary);
        return acc;
      }, []);
    },
    // 空の月次情報を作成
    empty_summary: function(date) {
      return {
        "y": date.getFullYear(),
        "m": date.getMonth(),
        "food": 0,
        "otfd": 0,
        "good": 0,
        "frnd": 0,
        "trfc": 0,
        "play": 0,
        "hous": 0,
        "engy": 0,
        "cnct": 0,
        "medi": 0,
        "insu": 0,
        "othr": 0,
        "earn": 0,
        "ttal": 0,
        "blnc": 0,
        "bnus": 0,
        "spcl": 0,
        "prvi": 0,
        "prvo": 0,
      };
    },
    // CSVの種別を内部的な種別IDに変換するメソッドを生成
    type_filter: function(is_special) {
      var f = {}
      f[this.type.FOOD] = function() { return "food"; };
      f[this.type.OTFD] = function() { return "otfd"; };
      f[this.type.GOOD] = function() { return "good"; };
      f[this.type.FRND] = function() { return "frnd"; };
      f[this.type.TRFC] = function() { return "trfc"; };
      f[this.type.PLAY] = function() { return "play"; };
      f[this.type.HOUS] = function() { return "hous"; };
      f[this.type.ENGY] = function() { return "engy"; };
      f[this.type.CNCT] = function() { return "cnct"; };
      f[this.type.MEDI] = function() { return "medi"; };
      f[this.type.INSU] = function() { return "insu"; };
      f[this.type.OTHR] = function() { return "othr"; };
      f[this.type.EARN] = function() { return "earn"; };
      f[this.type.TTAL] = function() { return ""; };
      f[this.type.BLNC] = function() { return ""; };
      if (is_special) {
        f[this.type.BNUS] = function() { return "bnus"; };
        f[this.type.SPCL] = function() { return "spcl"; };
      } else {
        f[this.type.BNUS] = function() { return ""; };
        f[this.type.SPCL] = function() { return ""; };
      }
      f[this.type.PRVI] = function() { return ""; };
      f[this.type.PRVO] = function() { return ""; };
      return f;
    },
    // 推移タブ前年
    graphic_prev_year: function(e) {
      this.graphic_date = this.prev_year(this.graphic_date);
      this.update_graphic(this.graphic_date);
    },
    // 推移タブ翌年
    graphic_next_year: function(e) {
      this.graphic_date = this.next_year(this.graphic_date);
      this.update_graphic(this.graphic_date);
    },
    // 推移タブ前月
    graphic_prev_month: function(e) {
      this.graphic_date = this.prev_month(this.graphic_date);
      this.update_graphic(this.graphic_date);
    },
    // 推移タブ翌月
    graphic_next_month: function(e) {
      this.graphic_date = this.next_month(this.graphic_date);
      this.update_graphic(this.graphic_date);
    },
    // グラフデータ更新
    update_graphic: function(date) {
      var gd_labels = this.empty_graphic_label();
      var gd_fd = this.empty_graphic_datas();
      var gd_ot = this.empty_graphic_datas();
      var gd_el = this.empty_graphic_datas();
      var gd_gs = this.empty_graphic_datas();
      var gd_wt = this.empty_graphic_datas();

      var dt = this.prev_year(date);
      for (var i = 0; i <= 12; i++) {
        var expenses = this.get_expenses(dt);

        gd_labels[i] = (dt.getMonth() + 1) + '月';
        gd_fd[i] = this.get_graphic_data_by_type(expenses, '食費');
        gd_ot[i] = this.get_graphic_data_by_type(expenses, '外食費');
        gd_el[i] = this.get_graphic_data_by_name(expenses, '電気代');
        gd_gs[i] = this.get_graphic_data_by_name(expenses, 'ガス代');
        gd_wt[i] = this.get_graphic_data_by_name(expenses, '水道代');

        dt.setMonth(dt.getMonth() + 1);
      }

      this.gd_labels = gd_labels;
      this.gd_fd = gd_fd;
      this.gd_ot = gd_ot;
      this.gd_el = gd_el;
      this.gd_gs = gd_gs;
      this.gd_wt = gd_wt;
    },
    // 空のラベルを作成
    empty_graphic_label: function() {
      return [ '', '', '', '', '', '', '', '', '', '', '', '', '' ];
    },
    // 空のデータを作成
    empty_graphic_datas: function() {
      return [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    },
    // グラフデータ取得(種別)
    get_graphic_data_by_type: function(expenses, type) {
      if (expenses == null || expenses.length == 0) {
        return 0;
      }

      return expenses.reduce(function(acc, cur) {
        if (cur.type == type) {
          return acc + Number(cur.cost);
        }
        return acc;
      }, 0);
    },
    // グラフデータ取得(名称)
    get_graphic_data_by_name: function(expenses, name) {
      if (expenses == null || expenses.length == 0) {
        return 0;
      }

      return expenses.reduce(function(acc, cur) {
        if (cur.name == name) {
          return acc + Number(cur.cost);
        }
        return acc;
      }, 0);
    },
    // グラフ描画
    draw_graphic: function() {
      var ctx = document.getElementById("graphic");

      var vm = this;
      vm.canvas = new Chart(ctx, {
        type: 'line',
        data: {
          labels: vm.gd_labels,
          datasets: [
            {
              label: '食費',
              data: vm.gd_fd,
              fill: false,
              borderColor: 'rgba(256, 192, 192, 1)',
              pointBackgroundColor: 'rgba(256, 0, 0, 1)',
            },
            {
              label: '外食費',
              data: vm.gd_ot,
              fill: false,
              borderColor: 'rgba(256, 206, 124, 1)',
              pointBackgroundColor: 'rgba(243, 152, 0, 1)',
            },
            {
              label: '電気代',
              data: vm.gd_el,
              fill: false,
              borderColor: 'rgba(256, 256, 153, 1)',
              pointBackgroundColor: 'rgba(256, 256, 0, 1)',
            },
            {
              label: 'ガス代',
              data: vm.gd_gs,
              fill: false,
              borderColor: 'rgba(192, 192, 192, 1)',
              pointBackgroundColor: 'rgba(128, 128, 128, 1)',
            },
            {
              label: '水道代',
              data: vm.gd_wt,
              fill: false,
              borderColor: 'rgba(192, 192, 256, 1)',
              pointBackgroundColor: 'rgba(0, 0, 256, 1)',
            },
          ],
        },
        options: {
          animation: {
            duration: 0,
          },
          elements: {
            line: {
              tension: 0,
            },
          },
          scales: {
            yAxes: [{
              ticks: {
                min: 0,
                max: 15000,
                stepSize: 2500,
                callback: function(value, index, values) {
                  return '￥' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
              }
            }],
          },
        },
      });
    },
    // 集計処理(収支)
    create_balances: function(expenses) {
      if (expenses == null || expenses.length == 0) {
        return [];
      }

      var years = expenses.reduce(function(acc, cur) {
        var date = new Date(cur.date);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        if (acc.some(function(x) {
          return (x.getFullYear() == year && (4 <= month && month <= 12))
              || (x.getFullYear() + 1 == year && (1 <= month && month <= 3));
        })) {
          return acc;
        } else {
          acc.push(date);
        }
        return acc;
      }, []);

      var f = this.type_filter(true);
      var balances = years.reduce(function(acc, cur) {
        var expenses = app.get_expenses_by_year(cur);
        var balance = expenses.reduce(function(acc, cur) {
          var type = f[cur.type]();
          if (type != "") {
            if (type == "earn" || type == "bnus") {
              acc[type] += Number(cur.cost);
            } else if (type == "spcl") {
              acc["special"] += Number(cur.cost);
            } else {
              acc["expense"] += Number(cur.cost);
            }
          }
          return acc;
        }, {
          "year": cur.getFullYear(),
          "earn": 0,
          "bnus": 0,
          "expense": 0,
          "special": 0,
          "balance": 0,
        });
        balance.balance = balance.earn + balance.bnus - balance.expense - balance.special;
        acc.push(balance);
        return acc;
      }, []);

      var total = balances.reduce(function(acc, cur) {
        acc["earn"] += cur["earn"];
        acc["bnus"] += cur["earn"];
        acc["expense"] += cur["expense"];
        acc["special"] += cur["special"];
        acc["balance"] += cur["balance"];
        return acc;
      }, {
          "year": 9999,
          "earn": 0,
          "bnus": 0,
          "expense": 0,
          "special": 0,
          "balance": 0,
      });
      balances.push(total);
      return balances;
    },
    // 集計処理(秘密)
    create_privates: function(expenses) {
      var targets = expenses.filter(function(x) {
        return x.type === app.type.PRVI || x.type === app.type.PRVO;
      });

      var balance = 0;
      var privates = [];
      for (var i = 0; i < targets.length; i++) {
        var exp = targets[i];
        balance += (exp.cost * (exp.type === app.type.PRVI ? 1 : -1));
        privates.push({
          date: exp.date,
          name: exp.name,
          cost: Number(exp.cost),
          blnc: balance,
          note: exp.note,
        });
      }
      return privates;
    },
    // ドラッグイン
    drag_enter: function(e) {
      this.is_drag_enter = true;
    },
    // ドラッグアウト
    drag_leave: function(e) {
      this.is_drag_enter = false;
    },
    // ドラッグ中
    drag_over: function(e) {
      e.preventDefault();
    },
    // ドロップ
    drop: function(e) {
      e.preventDefault();

      var files = e.target.files || e.dataTransfer.files;
      this.import_csv(files[0]);
    },
    // ファイル選択
    file_change: function(e) {
      var files = e.target.files || e.dataTransfer.files;
      this.import_csv(files[0]);
    },
    // CSVファイル読み込み
    import_csv: function(file) {
      this.is_loading = true;

      var vm = this;
      Papa.parse(file, {
        header: true,
        complete: function(results, file) {
          // 末尾に不要な行が読み込まれているので除外(Papa Parse のバグ?)
          var data = results.data.slice(0, results.data.length - 1);

          var ls = window.localStorage;
          ls.setItem('expenses', JSON.stringify(data));
          ls.setItem('summaries', JSON.stringify(app.create_summaries(data)));
          ls.setItem('balances', JSON.stringify(app.create_balances(data)));
          ls.setItem('privates', JSON.stringify(app.create_privates(data)));

          vm.initialize();
          vm.is_loading = false;
          vm.is_drag_enter = false;

          alert('インポートしました．');
        },
      });
    },
    // CSVファイルダウンロード
    export_csv: function(e) {
      var csv = Papa.unparse(this.expenses_all, {
        quotes: true,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ',',
        header: true,
        newline: "\r\n"
      });
      let blob = new Blob([csv], { type: "text/csv" });
      let link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'Abook.db';
      link.click();
    },
  },
});
