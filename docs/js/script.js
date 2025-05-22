var student_flag = false;
var grades_flag = false;

var student_file = null
var grades_file = null;

/* ============================================================ */
/* ファイルの変更を監視 */
$( "input[ name = 'file_input_grades' ]" ).change( function( ) {
    grades_flag = true;
    grades_file = $( this ).prop( "files" )[ 0 ]; // 入力ファイル取得

    // データ整形関数へ
    if( grades_flag && student_flag ) {
        format( );
    }
});

$( "input[ name = 'file_input_student' ]" ).change( function( ) {
    student_flag = true;
    student_file = $( this ).prop( "files" )[ 0 ]; // 入力ファイル取得

    // データ整形関数へ
    if( grades_flag && student_flag ) {
        format( );
    }
});

/* ------------------------------------------------------------ */

/* ============================================================ */
/* D&D対応関係 */
$( ".input_area" ).on( "drop", function( ) {
    this.style.backgroundColor = '';
});
$( '.input_area' ).on( 'dragover', function( ) {
    this.style.backgroundColor = '#82beef';
});
$( '.input_area' ).on( 'dragleave', function( ) {
    this.style.backgroundColor = '';
});

/* ------------------------------------------------------------ */

/* ============================================================ */
/* ファイル読込み */
async function format( ) {
    var students = await fetchAsText( student_file );
    var grades = await fetchAsText( grades_file );
    var result = [ ];

    students = students.split( '\r\n' );
    grades = grades.split( '\r\n' );

    students.shift( );
    if( students.slice( -1 )[ 0 ] == "" ) students.pop( );

    grades.shift( );

    for( i = 0; i < students.length; i++ ) students[ i ] = students[ i ].split( ',' );

    for( i = 0; i < students.length; i++ ) {
        students[ i ][ 5 ] = students[ i ][ 5 ].split( "@" )[ 0 ].substring( 2 );
        students[ i ].push( i );
    }

    for( i = 0; i < grades.length; i++ ) grades[ i ] = grades[ i ].split( ',' );

    for( i = 0; i < grades.length; i++ ){
        if( grades[ i ][ 0 ].length != 8 ) {
            grades.splice( i , 1 );
            i--;
        }
    }

    students.sort( function( a, b ){ return ( a[ 5 ] - b[ 5 ]);});
    grades.sort( function( a, b ){ return ( a[ 0 ] - b[ 0 ]);});

    for( i = 0; i < students.length; i++ ){
        result.push([ String.fromCharCode( 111, 107 ) + students[ i ][ 5 ] + String.fromCharCode(64, 111, 107, 115, 46, 105, 112, 117, 116, 46, 97, 99, 46, 106, 112), grades[ i ][ 11 ] < 5 ? 0 : 1, students[ i ][ 6 ]]);
    }

    result.sort( function( a, b ){ return ( a[ 2 ] - b[ 2 ]);});

    download( result );
}

/* ------------------------------------------------------------ */

/* ============================================================ */
// ファイルから内容をテキストとして取得する Promise を返す
var fetchAsText = ( file ) => {
    return new Promise(( resolve ) => {
        var reader = new FileReader( );

        reader.onload = ( e ) => {
            resolve( e.currentTarget.result );
        };

        reader.readAsText( file, "sjis" );
    });
};

/* ------------------------------------------------------------ */

/* ============================================================ */
/* ファイルダウンロード */
function download( data ) {
    const header = "メールアドレス,点数\r\n";
    let out_data = header;
    for( i = 0; i < data.length; i++ ) {
        out_data += data[ i ][ 0 ] + ",";
        out_data += data[ i ][ 1 ];

        out_data += "\r\n";
    }

    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, out_data], { type: "text/csv" });
    const url = URL.createObjectURL( blob );
    const a = document.createElement('a');

    let date = new Date( );
    let year = date.getFullYear( ).toString( ).padStart( 4, '0' );
    let month = (date.getMonth( ) + 1 ).toString( ).padStart( 2, '0' );
    let day = date.getDate( ).toString( ).padStart( 2, '0' );
    let hour = date.getHours( ).toString( ).padStart(  2, '0' );

    let dateText = year + month + day + "_" + hour + minute;

    a.href = url;
    a.download = "AE3_整形CSV" + dateText + ".csv";
    a.click( );

    a.remove();
}

/* ------------------------------------------------------------ */